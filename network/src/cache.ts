import { Download, Downloader } from 'miniprogram-downloader';
import { CacheOperator, Configuration, isOkResult } from 'miniprogram-network-cache';
import { Http, Request } from 'miniprogram-request';

/** 缓存配置 */
export const config: Configuration & {
    /** 不缓存方法 */
    excludeMethod: MethodParam['method'][];
} = {
    expire: 10 * 60 * 1000,
    /** GET,HEAD,OPTIONS默认缓存 */
    excludeMethod: ['POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT'],
    paramCondition: function (param) {
        return config.excludeMethod.indexOf((param as MethodParam).method) < 0;
    },
    resultCondition: isOkResult
};

/**
 * 网络缓存
 */
export const cacheHttp = new Http(Request.Defaults, CacheOperator.createHandler(Request.handle, config));
/**
 * 下载缓存
 */
export const cacheDownloader = new Downloader(Download.Defaults, CacheOperator.createHandler(Download.handle, config));

/**
 * request 缓存
 */
export const request: Http['request'] = cacheHttp.request.bind(cacheHttp) as Http['request'];
/**
 * GET 缓存
 */
// tslint:disable-next-line: no-reserved-keywords
export const get: Http['get'] = cacheHttp.get.bind(cacheHttp) as Http['get'];
/**
 * 下载缓存
 */
export const download: Downloader['download'] = cacheDownloader.download.bind(cacheDownloader) as Downloader['download'];

interface MethodParam {
    method?: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';
}
