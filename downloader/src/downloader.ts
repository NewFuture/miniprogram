import { WxQueue } from 'miniprogram-queue';
import { LifeCircle, BaseConfiguration, ExtraConfiguration } from 'miniprogram-network-life-circle'
import { defaultDowanloadTransformSend, defaultDownloadTransformResponse } from './transform';

const downloadQueue = new WxQueue<wx.DownloadFileOption, wx.DownloadTask>(wx.downloadFile);

/**
 * 默认配置信息
 */
export type DownloadInit = BaseConfiguration<DownloadOption, wx.DownloadFileOption>;
/**
 * 全部配置信息
 */
export interface DownloadOption extends DownloadInit, ExtraConfiguration<wx.DownloadTask> {
    url: NonNullable<string>,
    filePath?: string,
    onProgress?: wx.DownloadTask['offProgressUpdate']
}


export class Downloder extends LifeCircle<wx.DownloadFileOption, wx.DownloadTask, DownloadInit, DownloadOption> {

    /**
     * 默认下载请求参数转换函数
     */
    public readonly TransformSend = defaultDowanloadTransformSend;

    /**
     * 默认下载返回数据转换函数
     */
    // public readonly TransformResponse = defaultDownloadTransformResponse;

    /**
     * 新建 Http实列
     * @param config 全局默认配置
     */
    public constructor(config?: DownloadInit, downloader?: (o: wx.DownloadFileOption) => wx.DownloadTask) {
        super(downloader || downloadQueue.push, config);
    }

    /**
     * 快速下载
     * @param url 下载地址
     * @param filePath 本地文件路径
     * @param options 其他参数
     */
    public download<T>(url: string, filePath?: string, options?: Exclude<DownloadOption, 'url' | 'filePath'>): Promise<T>;
    /**
     * Object 参数自定义下载
     * @param options 
     */
    public download<T>(options: DownloadOption): Promise<T>;
    public download<T>(): Promise<T> {
        const is_multi_param = typeof arguments[0] === 'string';
        const options: DownloadOption = is_multi_param ? (arguments[2] || {}) : arguments[0];
        if (is_multi_param) {
            options.url = arguments[0];
            options.filePath = arguments[1];
        }
        return this.process<T>(options);
    }
};