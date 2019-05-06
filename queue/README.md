# miniprogram-queue [![npm version](https://badge.fury.io/js/miniprogram-queue.svg)](https://npmjs.com/package/miniprogram-queue)

> Queue Package for MiniProgram API
>
> 小程序底层操作队列化(`wx.request`, `wx.downloadFile`,`wx.uploadFile`)
> 
> [miniprogram-network](https://npmjs.com/package/miniprogram-network)默认队列实现 

Features:

* [x] 可自动注入/手动管理
* [x] [取消操作(`abort`)](#abort-取消操作)
* [x] [进度/header回调](#progress-进度支持)
* [x] [插队](#jump-插队)
* [x] 时间戳
* [x] timeout 自定义超时时间
* [ ] 动态收缩扩展

## Install(安装)

```
npm i miniprogram-queue
```

## Usage(使用)

```js
import {WxQueue} from 'miniprogram-queue';
//创建请求队列
const requestQueue = new WxQueue(wx.request,10);
// const uploadQueue = new WxQueue(wx.uploadFile,10);
// const downloadQueue = new WxQueue(wx.downloadFile,10);

// 发送请求
const task = requestQueue.push({
    url:'https://github.com/NewFuture/miniprogram-network/'
});

// task.abort() 可取消操作
```

## API 

### 参数

与官网API参数兼容 支持 扩展参数:
* `onProgressUpdate` 进度回调函数
* `onHeadersReceived` 响应头回调函数
* `jump` (默认`false`)是否插队
* `timestamp` (默认`false`) 是否记录时间戳,是则complete回调中会包含 一个`time`字段
```ts
{
    send: number,
    response: number
}
```

兼容API
* [request](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)
* [downloadFile](https://developers.weixin.qq.com/miniprogram/dev/api/network/download/wx.downloadFile.html)
* [uploadFile](https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/wx.uploadFile.html) 

同时 `downloadFile` 和 `uploadFile` 支持通过[process 参数](#progress) 之间设置进度回调

### jump (插队)

```js
//第二个参数为true时优先级最高
requestQueue.push({
    url:'https://github.com/',
    jump:true,//插队
});
```

## Abort (取消操作)

所有操作返回一个`Task`对象，可取消操作

注意: 和官方API一致 **取消时依然会执行complete(如果配置了)**。

* 自动注入方式
```js
var task = wx.request(obj);
task.abort();
```

* 手动push
```js
var task = queue.push(obj);
task.abort();
```

## Progress (进度支持)

* `DownloadTask.onProgressUpdate(function callback)`
* `UploadTask.onProgressUpdate(function callback)`

> 小程序`onProgressUpdate`API的接口，设计上不太合理,
> 这个接口放在请求发生时更合适,而非在Task创建后。

此处保留了对onProgressUpdate的兼容适配,同时提供了可通过参数(`progress`)传入的方法

```js

const task =uploadQueue.push({
    // 其他参数
    onProgressUpdate:processCallback// callback function
    onHeadersReceived:console.log
});
// function processCallback(progress,currentBytes,totalBytes){}
```

```js
// obj update object
const task = wx.uploadFile(obj);
// 保留原生调用方式支持
task.onProgressUpdate(processCallback); // callback function
// function processCallback(progress,currentBytes,totalBytes){}
```
