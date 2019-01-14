import {
  Download,
  Downloader,
  DownloadInit as NetworkDownloadInit,
  DownloadOption as NetworkDownloadOption,
  DownloadParams as NetworkDownloadParams
} from 'miniprogram-downloader';
import {
  Http,
  Request,
  RequestConfig as NetworkRequestConfig,
  RequestInit as NetworkRequestInit,
  RequestOption as NetworkRequestOption,
  RequestParams as NetworkRequestParams
} from 'miniprogram-request';
import {
  Upload,
  Uploader,
  UploadInit as NetworkUploadInit,
  UploadOption as NetworkUploadOption,
  UploadParams as NetworkUploadParams
} from 'miniprogram-uploader';

export { setConfig } from './set-config';
export {
  get as getCache,
  request as requestCache,
  download as downloadCache,
  config as CacheConfig
} from './cache';
export {
  Http,
  Request,
  transformRequestResponseOkData,
  transformRequestSendDefault,
  CancelToken
} from 'miniprogram-request';
export {
  Uploader,
  Upload,
  transformUploadResponseOkData,
  transformUploadSendDefault
} from 'miniprogram-uploader';
export {
  Downloader,
  Download,
  transformDownloadResponseOkData,
  transfomDownloadSendDefault
} from 'miniprogram-downloader';
// ShortLink for Request
/**
 * Request.request
 */
export const request: Http['request'] = Request.request.bind(
  Request
) as Http['request'];
/**
 * Request.get
 */
// tslint:disable-next-line: no-reserved-keywords
export const get: Http['get'] = Request.get.bind(Request) as Http['get'];
/**
 * Request.post
 */
export const post: Http['post'] = Request.post.bind(Request) as Http['post'];
/**
 * Request.put
 */
export const put: Http['put'] = Request.put.bind(Request) as Http['put'];
/**
 * Request.delete
 */
export const del: Http['delete'] = Request.delete.bind(
  Request
) as Http['delete'];
/**
 * Request.patch
 */
export const patch: Http['patch'] = Request.patch.bind(
  Request
) as Http['patch'];
/**
 * Request.head
 */
export const head: Http['head'] = Request.head.bind(Request) as Http['head'];

// Short Link for Download
/**
 * Download.download
 */
export const download: Downloader['download'] = Download.download.bind(
  Download
) as Downloader['download'];

// ShortLink for Upload
/**
 * Upload.upload
 */
export const upload: Uploader['upload'] = Upload.upload.bind(
  Upload
) as Uploader['upload'];

export declare namespace Network {
  /**
   * Full Options for send a Request
   */
  type RequestOption = NetworkRequestOption;
  /**
   * Extra Request Config for each Request
   */
  type RequestConfig = NetworkRequestConfig;
  /**
   * Request Defaults Config to init a HTTP
   */
  type RequestInit = NetworkRequestInit;
  /**
   * return type for Request TransformSend
   */
  type RequestParams = NetworkRequestParams;
  /**
   * Full Options for download
   */
  type DownloadOption = NetworkDownloadOption;
  /**
   * Defaults Config to init a Downloader
   */
  type DownloadInit = NetworkDownloadInit;
  /**
   * return type for Download TransformSend
   */
  type DownloadParams = NetworkDownloadParams;
  /**
   * Full Options for upload
   */
  type UploadOption = NetworkUploadOption;
  /**
   * Defaults Config to init a Uploader
   */
  type UploadInit = NetworkUploadInit;
  /**
   * return type for Upload TransformSend
   */
  type UploadParams = NetworkUploadParams;
}
