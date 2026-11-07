"""Resolve logical original/... resources after the Cocos bundle split.

Reads tolerate an in-progress move. Writes always follow the routing table and
reject unplanned files in a split project, so exports cannot recreate a second
assets/resources/original tree. This module never accesses the Unity SOURCE.
"""
from pathlib import Path, PurePosixPath
import json

PROJECT = Path(__file__).resolve().parents[1]
ROUTES_FILE = PROJECT / 'assets/resources/bundle-routes.json'
LOADING_FILES = {
    'original/extras/' + name for name in
    ('bgLoad_8', 'btz_11', 'pb_0_6', 'pb_1_7', 'fl_l_9', 'fl_r_4', 'fl_b_10')
}


def resource_file(logical: str, *, write: bool = False) -> Path:
    """Return the file for a logical resource including its extension.

    With write=True, create its parent directory but never create the file.
    Unmapped output requires adding a route, or using an isolated pre-split
    checkout/export directory; silently placing new assets in resources is not
    supported after splitting.
    """
    relative = PurePosixPath(str(logical).replace('\\', '/'))
    if relative.is_absolute() or '..' in relative.parts or not str(relative).startswith('original/'):
        raise ValueError(f'Expected a relative original/... resource: {logical}')
    key_path = relative.with_suffix('') if relative.suffix == '.meta' else relative
    key = str(key_path.with_suffix('')) if key_path.suffix else str(key_path)
    manifest = json.loads(ROUTES_FILE.read_text()) if ROUTES_FILE.exists() else None
    bundle = manifest['routes'].get(key) if manifest else None
    legacy = PROJECT / 'assets/resources' / str(relative)
    routed = PROJECT / 'assets/bundles' / bundle / str(relative) if bundle else legacy
    if not write:
        if routed.exists():
            return routed
        if legacy.exists():
            return legacy
        return routed
    if manifest and not bundle and key not in LOADING_FILES:
        raise ValueError(f'No bundle route for output {logical}; add a route or export in an isolated pre-split project.')
    routed.parent.mkdir(parents=True, exist_ok=True)
    return routed


def manifest_file(*, write: bool = False) -> Path:
    """The extraction inventory is reference data, never a runtime resource."""
    archived = PROJECT / 'assets/reference/original/manifest.json'
    legacy = PROJECT / 'assets/resources/original/manifest.json'
    if not write:
        return archived if archived.exists() or not legacy.exists() else legacy
    archived.parent.mkdir(parents=True, exist_ok=True)
    return archived
