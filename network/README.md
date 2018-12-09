# miniprogram-network [![npm version](https://badge.fury.io/js/miniprogram-network.svg)](https://npmjs.com/package/miniprogram-network)

> A Network package for MiniProgram
>
> 小程序底层网络库封装


## Todo
* [x] [request](https://www.npmjs.com/package/miniprogram-request)
* [x] [upload](https://www.npmjs.com/package/miniprogram-uploader)
* [x] [download](https://www.npmjs.com/package/miniprogram-downloader)
* [ ] websocket


## 网络库封装

* [x] Promise<T>泛型Promise
* [x] CancelToken 可取消操作
* [x] Queue 队列支持
* [x] Retry 网络错误自动重试
* [x] 每个请求的原生回调接口支持(`onHeadersReceived`事件)和(`onProgressUpdate`事件)
* [x] Interceptors 拦截器 transform send data / transform response data
* [x] Listeners 全局事件监听`onSend`,`onResponse`,`onRejected`,`onAbort`,`onComplete`

## 数据转换

默认的`transformResponse`直接返回小程序原始的返回数据{statusCode,...}

同时提供了根据状态码返回对应数据的转换方式

```js
import {
    Request, transformRequestResponseOkData,
    Download, transformDownloadResponseOkData,
    Upload, transformUploadResponseOkData,
} from 'miniprogram-network';

// Request的默认响应拦设为成transformRequestResponseOkData,
// 正常2xx返回data部分，否则rejected
Request.Defaults.transformResponse = transformRequestResponseOkData;
// Download的默认响应拦设为transformDownloadResponseOkData，
// 正常2xx返回string,否则rejected
Download.Defaults.transformResponse = transformDownloadResponseOkData;
// Upload默认响应拦截transformUploadResponseOkData,
//正常2xx返回data,否则rejected
Upload.Defaults.transformResponse = transformUploadResponseOkData;

Download.download('url')
    .then(path=>{
        console.log(path);//string
    }).catch(res=>{
        console.error(res);//objct
    });
```

## 快速配置 setConfig

```js
import { setConfig } from 'miniprogram-network';

//将Request,Upload,Download的默认baseURL设置为'https://api.newfuture.cc'
setConfig('baseURL', 'https://api.newfuture.cc');

//等效方式
setConfig({
    baseURL:'https://api.newfuture.cc'
})

```


## LifeCircle

详情说明[miniprogram-network-life-circle](https://github.com/NewFuture/miniprogram-network/tree/master/life-circle)
![](https://user-images.githubusercontent.com/6290356/49631309-6bddc080-fa2c-11e8-9a41-88fb50b2a1b7.png)