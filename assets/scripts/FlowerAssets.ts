import { Asset, AssetManager, assetManager, JsonAsset, resources, sys } from 'cc';
import { PREVIEW } from 'cc/env';

type AssetConstructor<T extends Asset> = new (...args: any[]) => T;
type AssetCallback<T extends Asset> = (error: Error | null, asset: T) => void;
interface BundleRoute { readonly remote: boolean }
interface BundleRoutes {
    readonly routes: Readonly<Record<string, string>>;
    readonly bundles: Readonly<Record<string, BundleRoute>>;
}
let routesPromise: Promise<BundleRoutes> | null = null;
const bundles = new Map<string, Promise<AssetManager.Bundle>>();

function loadRoutes(): Promise<BundleRoutes> {
    if (!routesPromise) {
        routesPromise = new Promise<BundleRoutes>((resolve, reject) => {
            // This small routing table and the seven first-paint images stay in resources.
            resources.load('bundle-routes', JsonAsset, (error, asset) => {
                if (error) { reject(error); return; }
                const value = asset.json as BundleRoutes;
                if (!value || !value.routes || !value.bundles) { reject(new Error('资源分包路由表不完整')); return; }
                const names: Record<string, BundleRoute> = {};
                for (const [name, entry] of Object.entries(value.bundles)) names[name] = Object.freeze({remote: !!entry.remote});
                for (const [path, name] of Object.entries(value.routes)) {
                    if (!path || typeof name !== 'string' || !names[name]) { reject(new Error(`资源分包路由无效：${path}`)); return; }
                }
                resolve(Object.freeze({routes: Object.freeze({...value.routes}), bundles: Object.freeze(names)}));
            });
        }).catch(error => { routesPromise = null; throw error; });
    }
    return routesPromise;
}

function loadBundle(name: string, route: BundleRoute): Promise<AssetManager.Bundle> {
    const loaded = assetManager.getBundle(name);
    if (loaded) return Promise.resolve(loaded);
    const pending = bundles.get(name);
    if (pending) return pending;
    // Preview serves named bundles locally. Published WeChat remote bundles need
    // the real server configured by Creator; never invent or bake in a CDN URL.
    if (route.remote && !PREVIEW && sys.platform === sys.Platform.WECHAT_GAME
        && !assetManager.downloader.remoteServerAddress) {
        return Promise.reject(new Error(`资源包 ${name} 尚未配置远程资源地址，请在构建设置填写资源服务器地址。`));
    }
    const task = new Promise<AssetManager.Bundle>((resolve, reject) => {
        assetManager.loadBundle(name, (error, bundle) => error ? reject(error) : resolve(bundle));
    }).catch(error => { bundles.delete(name); throw error; });
    bundles.set(name, task);
    return task;
}

/** Same callback contract as resources.load; all callers retain original/... paths. */
export function loadFlowerAsset<T extends Asset>(path: string, type: AssetConstructor<T>, callback: AssetCallback<T>): void {
    const routePath = path.replace(/\/spriteFrame$/, '');
    void loadRoutes().then(async routes => {
        const name = routes.routes[routePath];
        const owner = name ? await loadBundle(name, routes.bundles[name]) : resources;
        return new Promise<T>((resolve, reject) => {
            owner.load(path, type, (error, asset) => error ? reject(error) : resolve(asset));
        });
    }).then(asset => callback(null, asset), error => {
        // Cocos supplies no usable asset on an error, while keeping the callback's T signature.
        callback(error instanceof Error ? error : new Error(String(error)), null as unknown as T);
    });
}
