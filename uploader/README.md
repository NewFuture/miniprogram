# miniprogram-uploader [![npm version](https://badge.fury.io/js/miniprogram-uploader.svg)](https://npmjs.com/package/miniprogram-uploader)

> An axios API like `Upload` package for MiniProgram
>
> 小程序上传封装
> 小程序网络库[miniprogram-network](https://github.com/NewFuture/miniprogram-network) 核心库之一


## API

### methods:

* `upload<T>(options: UploadOption): Promise<T>`;
* `upload<T>(filePath: string, name: string, url?: string, options?):  Promise<T>`;

### options

* [x] `filePath` 文件路径  **required** (_只能请求时设置for single request_) 
* [x] `name` 上传文件名  **required** (_只能请求时设置for single request_) 
* [x] `data` 额外数据 (_只能请求时设置for single request_) 
* [x] `cancelToken` 取消 (_只能请求时设置for single request_) 
* [x] `onProgressUpdate` 下载进度响应 (_只能请求时设置for single request_) 
* [x] `onHeadersReceived` 接收头响应 (_只能请求时设置for single request_) 
* [x] `jump` 是否插队 (_只能请求时设置for single request_)
* [x] `timeout` 自定义超时时间ms (_只能请求时设置for single request_)
* [x] `url` 上传地址
* [x] `headers` 请求头
* [x] `params` URL参数
* [x] `baseURL` 根URL
* [x] `retry` 重试次数
* [x] `timestamp` 是否记录发送和响应时间戳
* [x] `transformSend` 输入转换函数
* [x] `transformResponse` 输出转换函数

### Global Listeners

* [x] `onSend` (before request data send & after request data transformed)
* [x] `onResponse` (after request response data transformed)
* [x] `onRejected` (before `catch` of Promise)
* [x] `onAbort`
* [x] `onComplete`

## Usage

### install
```
npm i miniprogram-uploader
```

### quick start

```js
import {UPLOAD} from 'miniprogram-uploader';
UPLOAD.upload(localPath,'file','https://upload.site/file')
    .then(console.log) // 返回数据
    .catch(err=>wx.showToast({title:'下载失败'}));
```


### 直接返回保存位置

```js
import {UPLOAD,transformUploadResponseOkData} from 'miniprogram-uploader';
// 根据状态码，直接返回保存地址
//默认配置全局有效
UPLOAD.Defaults.transformResponse=transformUploadResponseOkData;

//js
UPLOAD.upload(localPath,'file','https://upload.site/file').then(console.log);//打印data string
//TS
UPLOAD.upload<{url:string}>(localPath,'file','https://upload.site/file')
    .then(data=>{
        console.log(data)//打印数据object {url:'xxx'}
    }) 

//返回完整数据 对当前下载有效
UPLOAD.upload(url:'item/1.jpg',null,{transformResponse:(res,o)=>res})
    .then(console.log) //打印 返回的Object {errMsg:'xx',data:"{url:'xxx'}"}
```



### CancelToken (abort)

可通过cancel token 方式取消请求
```js
import { UPLOAD, CancelToken } from 'miniprogram-uploader';

// 创建一个 tokensource
const source = CancelToken.source();

UPLOAD.upload({ 
    filePath:localPath,
    file:'tempfile', 
    // 配置 cancelToken
    cancelToken: source.token 
});

// 需要取消操作时
source.cancel('canceled');
```
