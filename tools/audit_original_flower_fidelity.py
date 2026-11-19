"""Read-only Unity flower audit; write evidence only to the requested destination.

Requires UnityPy (tested with 1.25.2). Never rewrites source archives, runtime
assets, manifests or Cocos import metadata.
"""
import argparse
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import struct

import lz4.block
import UnityPy
from UnityPy.export.ShaderConverter import ShaderProgram
from UnityPy.streams import EndianBinaryReader

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--out', type=Path, required=True)
args = parser.parse_args()
project = Path(__file__).resolve().parents[1]
routes = json.loads((project / 'assets/resources/bundle-routes.json').read_text())['routes']
key = 'original/data/flower-click-shapes'
existing = json.loads((project / 'assets/bundles' / routes[key] / (key + '.json')).read_text())['shapes']
inventory = json.loads((project / 'assets/reference/original/manifest.json').read_text())
sprite_assets = {a['resource']: a for a in inventory['assets'] if a['type'] == 'Sprite'}
env = UnityPy.load(str(args.source))
objects = list(env.objects)
object_index = {(o.assets_file.name, o.path_id): o for o in objects}
output = {
    'source': str(args.source),
    'sourceSha256': hashlib.sha256(args.source.read_bytes()).hexdigest(),
    'unityVersions': sorted({o.assets_file.unity_version for o in objects}),
    'scope': 'Static runtime-package evidence; no original game code executed.',
    'flowers': {}, 'components': {}, 'shaders': {},
}


def vec(v):
    return {k: getattr(v, k) for k in ('x', 'y', 'z', 'w', 'r', 'g', 'b', 'a') if hasattr(v, k)}


def transform(go):
    return next(c.component.read() for c in go.m_Component if c.component.type.name in ('Transform', 'RectTransform'))


def matrix(t):
    q, s, p = t.m_LocalRotation, t.m_LocalScale, t.m_LocalPosition
    assert abs(q.x) < 1e-6 and abs(q.y) < 1e-6
    a = 2 * math.atan2(q.z, q.w)
    c, sn = math.cos(a), math.sin(a)
    return [c*s.x, sn*s.x, -sn*s.y, c*s.y, p.x, p.y]


def point(m, p):
    return [m[0]*p[0]+m[2]*p[1]+m[4], m[1]*p[0]+m[3]*p[1]+m[5]]


def inverse(m):
    a, b, c, d, x, y = m
    det = a*d-b*c
    assert abs(det) > 1e-10
    return [d/det, -b/det, -c/det, a/det, (c*y-d*x)/det, (b*x-a*y)/det]


def descendants(go, path=''):
    path += '/' + go.m_Name
    yield go, path
    for child in transform(go).m_Children:
        yield from descendants(child.read().m_GameObject.read(), path)


def max_error(a, b):
    if isinstance(a, list):
        assert len(a) == len(b)
        return max((max_error(x, y) for x, y in zip(a, b)), default=0)
    return abs(a-b)


physical_types, half_settings = Counter(), Counter()
for obj in objects:
    if obj.type.name != 'GameObject':
        continue
    root = obj.read()
    resource = 'original/flower/' + root.m_Name
    if resource not in existing:
        continue
    nodes = list(descendants(root))
    major = next(go for go, _ in nodes if go.m_Name == 'FlowerMajor')
    click = next(go for go, _ in nodes if go.m_Name == 'LayerClick')
    # SetSprite replaces the prefab's editor default at runtime; a few defaults
    # refer to a different variant. Use the actual catalog/exported resource.
    asset = sprite_assets[resource]
    sprite = object_index[(asset['unityFile'], asset['pathId'])].read()
    collider = next(c.component.deref() for c in click.m_Component if c.component.type.name.endswith('Collider2D'))
    cd = collider.read_typetree()
    record = existing[resource]
    width, height = record['width'], record['height']
    assert sprite.image.size == (width, height), (resource, sprite.m_Name, sprite.image.size, (width, height))
    to_major, click_matrix = inverse(matrix(transform(major))), matrix(transform(click))
    offset, ppu = sprite.m_RD.textureRectOffset, sprite.m_PixelsToUnits
    shift = [sprite.m_Pivot.x*sprite.m_Rect.width-offset.x-width/2,
             sprite.m_Pivot.y*sprite.m_Rect.height-offset.y-height/2]

    def norm(x, y):
        xy = point(to_major, point(click_matrix, [x, y]))
        return [(xy[0]*ppu+shift[0])/width, (xy[1]*ppu+shift[1])/height]

    ox, oy = cd['m_Offset']['x'], cd['m_Offset']['y']
    if collider.type.name == 'PolygonCollider2D':
        actual = [[norm(p['x']+ox, p['y']+oy) for p in path] for path in cd['m_Points']['m_Paths']]
        error = max_error(actual, record['paths'])
    else:
        radius = cd['m_Radius']
        center, x, y = norm(ox, oy), norm(ox+radius, oy), norm(ox, oy+radius)
        actual = [center, [x[0]-center[0], x[1]-center[1]], [y[0]-center[0], y[1]-center[1]]]
        error = max_error(actual, [record['center'], record['axisX'], record['axisY']])
    assert error < 1e-7, (resource, error)
    flower = {'file': obj.assets_file.name, 'rootPathId': obj.path_id,
              'clickColliderPathId': collider.path_id, 'clickShapeMaxError': error,
              'physics': [], 'renderers': []}
    for go, path in nodes:
        for cp in go.m_Component:
            c, kind = cp.component.deref(), cp.component.type.name
            if kind.endswith('Collider2D'):
                d = c.read_typetree()
                if not d['m_IsTrigger']:
                    physical_types[kind] += 1
                    flower['physics'].append({'path': path, 'pathId': c.path_id, 'type': kind,
                        'transform': matrix(transform(go)),
                        'shape': {k: d[k] for k in ('m_Size', 'm_Radius', 'm_Direction', 'm_Offset', 'm_Points') if k in d}})
            elif kind == 'SpriteRenderer':
                d = c.read()
                flower['renderers'].append({'path': path, 'pathId': c.path_id, 'color': vec(d.m_Color),
                    'materials': [p.read().m_Name for p in d.m_Materials if p.path_id]})
            elif kind == 'MonoBehaviour':
                d = c.read(check_read=False)
                if d.m_Script.read().m_ClassName == 'HalfSubmergedSimple':
                    b = c.get_raw_data()
                    assert len(b) == 100
                    keys = 'waterCut cutSoftness cutTilt curveStrength curveCenter curveWidth curvePower waveStrength waveSpeed waveDensity'.split()
                    values = struct.unpack_from('<10f', b, 56)
                    flower['halfSubmerged'] = {'pathId': c.path_id, **dict(zip(keys, values))}
                    half_settings[values] += 1
    output['flowers'][resource] = flower

assert set(output['flowers']) == set(existing)
for obj in objects:
    if obj.type.name == 'MonoBehaviour' and obj.assets_file.name == 'level2' and obj.path_id in (698, 704, 712):
        d = obj.read(check_read=False)
        name, raw = d.m_Script.read().m_ClassName, obj.get_raw_data()
        output['components'][name] = {'file': obj.assets_file.name, 'pathId': obj.path_id, 'serializedHex': raw.hex()}
        if name == 'CameraWidthAdapter':
            output['components'][name]['reference'] = dict(zip(['width', 'height', 'orthoSize'], struct.unpack_from('<3f', raw, 32)))
        elif name == 'FlowerWaterFlowController':
            output['components'][name]['settings'] = {
                'updateInterval': struct.unpack_from('<f', raw, 32)[0], 'updateStep': struct.unpack_from('<i', raw, 36)[0],
                'directionInterval': list(struct.unpack_from('<2f', raw, 40)),
                'linearDrag': struct.unpack_from('<f', raw, 48)[0], 'angularDrag': struct.unpack_from('<f', raw, 52)[0],
                'torqueImpulse': struct.unpack_from('<f', raw, 56)[0],
                'gapPullRadius': struct.unpack_from('<f', raw, 108)[0], 'gapPullImpulse': struct.unpack_from('<f', raw, 112)[0]}
    elif obj.type.name == 'Shader' and obj.assets_file.name == 'resources.assets' and obj.path_id in (1086, 1090):
        d = obj.read()
        blob = lz4.block.decompress(bytes(d.compressedBlob), uncompressed_size=d.decompressedLengths[0][0])
        program = ShaderProgram(EndianBinaryReader(blob, endian='<'), obj.version)
        shaders = []
        for i, sub in enumerate(program.m_SubPrograms):
            if not sub.m_ProgramCode.startswith(b'#ifdef VERTEX'):
                continue
            target = args.out.parent / 'unity-shader-evidence-2026-11-12' / f'{obj.path_id}-{i}.glsl'
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(sub.m_ProgramCode)
            shaders.append({'file': str(target.relative_to(args.out.parent)), 'keywords': sub.m_Keywords,
                            'sha256': hashlib.sha256(sub.m_ProgramCode).hexdigest()})
        output['shaders'][str(obj.path_id)] = {'name': d.m_ParsedForm.m_Name, 'programs': shaders}

output['summary'] = {'flowerCount': len(output['flowers']), 'clickShapeMatches': len(output['flowers']),
    'maxClickShapeError': max(f['clickShapeMaxError'] for f in output['flowers'].values()),
    'physicalColliderTypes': dict(physical_types), 'halfSubmergedSettingsVariants': len(half_settings)}
args.out.parent.mkdir(parents=True, exist_ok=True)
args.out.write_text(json.dumps(output, ensure_ascii=False, indent=2))
print(json.dumps(output['summary'], ensure_ascii=False))
