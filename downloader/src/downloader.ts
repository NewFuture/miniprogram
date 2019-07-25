import { BaseConfiguration, ExtraConfiguration, LifeCycle, SuccessParam } from 'miniprogram-network-life-cycle';
import { ParamsType, GeneralCallbackResult } from 'miniprogram-network-utils';
import { transfomDownloadSendDefault } from './transform';

/**
 * 默认配置信息
 */
export type DownloadInit<T extends {} = {}, TReturn = any> = BaseConfiguration<FullDownloadOption<T, TReturn>, T & wx.DownloadFileOption, TReturn>;
interface BaseDownloadOption {
    /**
     * 下载地址
     * 如果URL以`http://`或者`https://`开头将忽略 baseURL
     */
    url: NonNullable<string>;
    /**
     * 本地路径可缓存
     */
    filePath?: string;
}

/**
 * 全部配置信息
 */
export interface FullDownloadOption<T extends {} = {}, TReturn = any>
    extends DownloadInit<T, TReturn>, ExtraConfiguration, BaseDownloadOption {
    /**
     * 下载进度回调函数
     */
    onProgressUpdate?: wx.DownloadTaskOnProgressUpdateCallback;
}

/**
 * 下载的额外配置
 * @template TParams 路径参数(如`/items/{id}`或者`/{0}/{1}`)的格式类型,默认 任意object或数组
 * @template TExt 额外的扩展属性
 */
type DownloadConfig<
    TParams = ParamsType,
    TExt extends {} = {},
    TReturn = any,
    > = Partial<TExt> & Partial<DownloadInit<TExt, TReturn> & ExtraConfiguration> & {
        /**
         * 路径参数
         * URL Path Params
         * the path parameters to be replace in path
         * Must be a plain `object` or `array`
         * @example
         *  url = "/{ID}/status"
         *  param = {ID: 12345}
         *  request url will be /1234/status
         */
        params?: TParams;

        /**
         * 下载进度回调函数
         */
        onProgressUpdate?: wx.DownloadTaskOnProgressUpdateCallback;
    };

/**
 * 下载的全部配置项
 * @template TData patch data参数格式类型,默认 any
 * @template TParams 路径参数(如`/items/{id}`或者`/{0}/{1}`)的格式类型,默认 任意object或数组
 */
export type DownloadOption<
    TParams = ParamsType,
    TExt extends {} = {},
    TReturn = any,
    >
    = DownloadConfig<TParams, TExt, TReturn> & BaseDownloadOption;

/**
 * 下载封装
 * @template T 扩展参数类型
 */
export class Downloader
    <T extends {} = {}>
    extends LifeCycle<
    T & wx.DownloadFileOption,
    wx.DownloadTask,
    DownloadInit<T>,
    FullDownloadOption<T>
    > {
    /**
     * 新建 Http实列
     * @param config 全局默认配置
     * @param downloader 下载处理方法，默认使用下载队列处理
     * @param listeners 下载事件监听回调
     */
    public constructor(
        config?: DownloadInit<T>,
        downloader?: (o: T & wx.DownloadFileOption) => wx.DownloadTask,
        listeners?: Downloader<T>['Listeners']
    ) {
        super(
            // tslint:disable-next-line: no-use-before-declare
            downloader || wx.downloadFile,
            // tslint:disable-next-line: no-object-literal-type-assertion
            config || { transformSend: transfomDownloadSendDefault } as DownloadInit<T>,
            listeners
        );
    }

    /**
     * 使用自定义参数下载
     * @param options - 完整下载参数
     * @template TReturn Promise 返回的格式类型,默认返回微信原始返回数据格式
     * @template TParams 路径参数(如`/items/{id}`或者`/{0}/{1}`)的格式类型,默认 任意object或数组
     */
    public download<
        TReturn = SuccessParam<wx.DownloadFileOption>,
        TParams = ParamsType, // 参数类型
        >(options: DownloadOption<TParams, T, TReturn>): Promise<TReturn>;
    /**
     * 快速下载
     * @param url 下载地址
     * @param filePath 本地文件路径
     * @param config 其他参数
     * @template TReturn Promise 返回的格式类型,默认返回微信原始返回数据格式
     * @template TParams 路径参数(如`/items/{id}`或者`/{0}/{1}`)的格式类型,默认 任意object或数组
     */
    public download<
        TReturn = SuccessParam<wx.DownloadFileOption>,
        TParams = ParamsType, // 参数类型
        >(
            url: string,
            filePath?: string,
            config?: DownloadConfig<TParams, T, TReturn>
        ): Promise<TReturn>;
    public download<TReturn>(): Promise<TReturn> {
        const isMultiParam = typeof arguments[0] === 'string';
        // tslint:disable-next-line: no-unsafe-any
        const options: FullDownloadOption<T> = isMultiParam ? (arguments[2] || {}) : arguments[0] as FullDownloadOption<T>;
        if (isMultiParam) {
            options.url = arguments[0] as string;
            options.filePath = arguments[1] as string;
        }
        return this.process<TReturn>(options);
    }
}

export declare namespace wx {
    function downloadFile(options: DownloadFileOption): DownloadTask;
    type DownloadTaskOnHeadersReceivedCallback = (result?: { header: object }) => void;
    type DownloadTaskOnProgressUpdateCallback = (
        result: {
            /** 下载进度百分比 */
            progress: number;
            /** 预期需要下载的数据总长度，单位 Bytes */
            totalBytesExpectedToWrite: number;
            /** 已经下载的数据长度，单位 Bytes */
            totalBytesWritten: number;
        }
    ) => void;

    interface DownloadFileOption {
        /** 下载资源的 url */
        url: string;
        /** 指定文件下载后存储的路径
         *
         * 最低基础库： `1.8.0`
         */
        filePath?: string;
        /** HTTP 请求的 Header，Header 中不能设置 Referer */
        header?: object;
        /** 接口调用结束的回调函数（调用成功、失败都会执行） */
        complete?(res: { errMsg: string }): void;
        /** 接口调用失败的回调函数 */
        fail?(res: { errMsg: string }): void;
        /** 接口调用成功的回调函数 */
        success?(result: DownloaderReponse): void;
    }
    interface DownloadTask {
        /**
         *
         * 中断下载任务
         *
         * 最低基础库： `1.4.0`
         */
        abort(): void;

        onHeadersReceived(
            /** HTTP Response Header 事件的回调函数 */
            callback: DownloadTaskOnHeadersReceivedCallback
        ): void;
        /** [DownloadTask.onProgressUpdate(function callback)](DownloadTask.onProgressUpdate.md)
         *
         * 监听下载进度变化事件
         *
         * 最低基础库： `1.4.0`
         */
        onProgressUpdate(
            /** 下载进度变化事件的回调函数 */
            callback: DownloadTaskOnProgressUpdateCallback
        ): void;
    }
}

export interface DownloaderReponse extends GeneralCallbackResult {
    /** 开发者服务器返回的 HTTP 状态码 */
    statusCode: number;
    /** 临时文件路径。如果没传入 filePath 指定文件存储路径，则下载后的文件会存储到一个临时文件 */
    tempFilePath: string;
}
