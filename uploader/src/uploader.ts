
import { BaseConfiguration, ExtraConfiguration, LifeCycle } from 'miniprogram-network-life-cycle';
import { Omit } from 'miniprogram-network-utils';
import { WxQueue } from 'miniprogram-queue';
import { transformUploadSendDefault } from './transform';

const uploadQueue = new WxQueue<wx.UploadFileOption, wx.UploadTask>(wx.uploadFile);
/**
 * 默认配置信息
 */
export interface UploadInit extends BaseConfiguration<UploadOption, wx.UploadFileOption> {
    url?: string,
};
/**
 * 全部配置信息
 */
export interface UploadOption<T extends object = NonNullable<wx.UploadFileOption['formData']>> extends UploadInit, ExtraConfiguration {
    filePath: NonNullable<string>,
    name: NonNullable<string>,
    data?: T,
    onProgressUpdate?: wx.UploadTaskOnProgressUpdateCallback,
}

/**
 * 上传管理
 */
export class Uploader extends LifeCycle<wx.UploadFileOption, wx.UploadTask, UploadInit, UploadOption>
{
    /**
     * 默认上传请求参数转换函数
     */
    protected readonly TransformSendDefault = transformUploadSendDefault;

    /**
     * 创建Upload管理
     * @param config 全局配置
     * @param uploader 操作函数,默认使用上传队列
     */
    constructor(config?: UploadInit, uploader?: (op: wx.UploadFileOption) => wx.UploadTask) {
        super(uploader || uploadQueue.push.bind(uploadQueue), config);
    }

    /**
     * 快速上传文件
     * @param filePath 本地文件路径
     * @param name 文件名
     * @param url 上传地址可选
     * @param data 附加formData数据，可选
     * @param options 其他参数
     */
    public upload<TReturn=ReturnType<Uploader['TransformResponseDefault']>, TData=object>(
        filePath: string,
        name: string,
        url?: string,
        data?: TData,
        config?: Omit<UploadOption, 'filePath' | 'name' | 'url' | 'data'>): Promise<TReturn>;
    /**
     * 自定义上传
     * @param options 全部配置信息:filePath,name,为必填字段
     */
    public upload<TReturn=ReturnType<Uploader['TransformResponseDefault']>, TData=object>(options: UploadOption<TData>): Promise<TReturn>;
    public upload<T>(): Promise<T> {
        const arg_num: number = arguments.length;
        const options: UploadOption = arg_num == 1 ? arguments[0] : (arguments[4] || {});
        if (arg_num > 1) {
            options.filePath = arguments[0];
            options.name = arguments[1];
            options.url = arguments[2];
            options.data = arguments[3];
        }
        return this.process<T>(options);
    }
};
