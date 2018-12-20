/// <reference path="./src/wx.request.d.ts"/>
import { Http } from './src/http';
export { CancelToken } from 'miniprogram-network-life-cycle';
export { RequestParams, transformRequestSendDefault, transformRequestResponseOkData } from './src/transform';
export { RequestOption, RequestConfig, RequestInit } from './src/configuration';
export { Http };
/**
 * 预定义全局 Request 对象
 */
export const Request = new Http();