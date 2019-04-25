/// <reference lib="es6"/>

/**
 * 微信小程序操作队列封装管理
 * @example var rq = new WxQueue(wx.requst);
 * @template TParam 微信操作参数类型
 * @template TTask 微信操返回task类型
 */
export class WxQueue<TParam extends BaseOption, TTask extends BaseTask> {
  /**
   *  队列最大长度
   */
  public readonly MAX: number;

  /**
   * 任务ID计数器
   */
  private taskid = 0;

  /**
   * 待完成队列
   */
  private readonly todo: [number, TParam & ExtraOptions][] = [];

  /**
   * 保持正在运行的任务
   */
  private readonly taskMap = new Map<number, [TTask, TimeRecorder?]>();

  /**
   * 小程序的原始操作API
   */
  private readonly operator: (params: TParam) => TTask;

  /**
   * 创建Wx操作队列
   * @param wxFunc Wx操作函数
   * @param maxLength 最大队列长度，默认10
   */
  constructor(wxFunc: (params: TParam) => TTask, maxLength: number = 10) {
    this.operator = wxFunc;
    this.MAX = maxLength || 10;
  }

  /**
   * 向队列中添加操作
   * @param param 微信操作
   */
  public push(param: QueueOption<TParam>): TTask {
    const id = ++this.taskid;
    if (this.taskMap.size < this.MAX) {
      // task队列未满
      return this._process(id, param);
    } else if (param.jump) {
      // 插队
      this.todo.unshift([id, param]);
    } else {
      this.todo.push([id, param]);
    }

    return {
      abort: (): void => { this._abort(id); },
      onProgressUpdate: (callback: ExtraOptions['onProgressUpdate']) => { this._onProgress(id, callback); },
      onHeadersReceived: (callback: ExtraOptions['onHeadersReceived']) => { this._onHeaders(id, callback); }
    } as any;
  }

  /**
   * check and do next task
   */
  private _next(): void {
    if (this.todo.length > 0 && this.taskMap.size < this.MAX) {
      const [taskid, taskOptions] = this.todo.shift()!;
      this._process(taskid, taskOptions);
    }
  }

  /**
   * process a task
   * @param id task ID
   * @param options  task param
   */
  private _process(id: number, options: QueueOption<TParam>): TTask {
    const oldComplete = options.complete;
    let timeoutFailHandle: number | undefined;
    let taskTimeoutCancelled = false;
    let task: TTask;

    options.complete = (res: { errMsg: string; time?: TimeRecorder; timeout?: boolean }) => {
      if (timeoutFailHandle) {
        // 清理计时器
        clearTimeout(timeoutFailHandle);
      }
      if (options.timestamp && this.taskMap.has(id)) {
        res.time = this.taskMap.get(id)![1] || {};
        res.time.response = Date.now();
      }
      this.taskMap.delete(id);
      // 原始结束回调
      if (oldComplete) {
        if (taskTimeoutCancelled) {
          res.errMsg = `${(res.errMsg || '').split(':', 1)[0]}: timeout`;
          res.timeout = true;
        }
        oldComplete.call(options, res);
      }
      this._next();
    };

    if (options.timeout! > 0) {
      // 自定义timeout 拦截fail 注入timeout
      const oldFail = options.fail;
      if (oldFail) {
        options.fail = (res: { errMsg: string; timeout?: boolean }) => {
          if (taskTimeoutCancelled) {
            res.errMsg = `${(res.errMsg || '').split(':', 1)[0]}: timeout`;
            res.timeout = true;
          }
          if (oldFail) {
            oldFail.call(options, res);
          }
        };
      }
      // 计时器 自定义超时
      timeoutFailHandle = setTimeout(
        () => {
          timeoutFailHandle = undefined;
          taskTimeoutCancelled = true;
          task.abort();
        },
        options.timeout!);
    }
    task = this.operator(options);

    // task progress polyfill
    if (options.onProgressUpdate && task.onProgressUpdate) {
      task.onProgressUpdate(options.onProgressUpdate);
    }
    // task onHeadersReceived
    if (options.onHeadersReceived) {
      task.onHeadersReceived(options.onHeadersReceived);
    }
    this.taskMap.set(id, [
      task,
      options.timestamp ? { send: Date.now() } : undefined
    ]);

    return task;
  }

  /**
   * stop and remove a task
   * @param taskid - the id of task to abort
   */
  private _abort(taskid: number) {
    const index = this.todo.findIndex(v => v[0] === taskid);
    if (index >= 0) {
      const completeCallback = this.todo[index][1].complete;
      this.todo.splice(index, 1);
      // call back complete.
      if (completeCallback) {
        completeCallback({ errMsg: 'request:fail abort', cancel: true, source: WxQueue.name });
      }
    } else if (this.taskMap.has(taskid)) {
      this.taskMap.get(taskid)![0].abort();
      this.taskMap.delete(taskid);
    }
  }

  /**
   * progress update callback
   * https://developers.weixin.qq.com/miniprogram/dev/api/network/download/DownloadTask.onProgressUpdate.html
   * @param taskid - task id
   * @param callback 回调操作
   */
  private _onProgress(
    taskid: number,
    callback: ExtraOptions['onProgressUpdate']
  ): void {
    const result = this.todo.find(v => v[0] === taskid);
    if (result) {
      result[1].onProgressUpdate = callback;
    } else if (this.taskMap.has(taskid)) {
      this.taskMap.get(taskid)![0].onProgressUpdate!(callback as any);
    }
  }

  private _onHeaders(
    taskid: number,
    callback: ExtraOptions['onHeadersReceived']
  ) {
    const result = this.todo.find(v => v[0] === taskid);
    if (result) {
      result[1].onHeadersReceived = callback;
    } else if (this.taskMap.has(taskid)) {
      this.taskMap.get(taskid)![0].onHeadersReceived(callback);
    }
  }
}

export type QueueOption<T> = T & ExtraOptions;

/**
 * 微信操作参数声明
 */
interface ExtraOptions {
  /**
   * progress 回调
   */
  onProgressUpdate?:
  | wx.UploadTaskOnProgressUpdateCallback
  | wx.DownloadTaskOnProgressUpdateCallback;
  /**
   * 是否插队
   */
  jump?: boolean;

  /**
   * 自定义超时时间
   */
  timeout?: number;

  /**
   * 记录时间戳
   */
  timestamp?: boolean | object;

  /**
   * 开发者服务器返回的 HTTP Response Header 回调
   */
  onHeadersReceived?(result: { header: object }): void;
}

interface BaseOption {
  /** 开发者服务器接口地址 */
  url: string;
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: Function;
  /** 接口调用失败的回调函数 */
  fail?: Function;
  /** 接口调用成功的回调函数 */
  success?: Function;
}

interface BaseTask {
  abort(): void;
  /** HTTP Response Header 事件的回调函数 */
  onHeadersReceived(callback: ExtraOptions['onHeadersReceived']): void;
  /** 下载进度变化事件的回调函数 */
  onProgressUpdate?(callback: ExtraOptions['onProgressUpdate']): void;
}

declare namespace wx {
  type UploadTaskOnProgressUpdateCallback = (
    res: {
      /**
       * 上传进度百分比
       */
      progress: number;
      /**
       * 已经上传的数据长度，单位 Bytes
       */
      totalBytesSent: number;
      /**
       * 预期需要上传的数据总长度，单位 Bytes
       */
      totalBytesExpectedToSend: number;
    }
  ) => void;

  type DownloadTaskOnProgressUpdateCallback = (
    res: {
      /**
       * 下载进度百分比
       */
      progress: number;
      /**
       * 已经下载的数据长度，单位 Bytes
       */
      totalBytesWritten: number;
      /**
       * 预期需要下载的数据总长度，单位 Bytes
       */
      totalBytesExpectedToWrite: number;
    }
  ) => void;
}

/**
 * 设定一个定时器。在定时到期以后执行注册的回调函数
 * @param callback - 回调操作
 * @param delay - 延迟的时间，函数的调用会在该延迟之后发生，单位 ms。
 * @param rest - param1, param2, ..., paramN 等附加参数，它们会作为参数传递给回调函数。
 */
declare function setTimeout(
  callback: Function,
  delay?: number,
  rest?: any
): number;

export interface TimeRecorder {
  send?: number;
  response?: number;
}

/**
 * 取消由 setTimeout 设置的定时器。
 * @param timeoutID - 要取消的定时器的
 */
declare function clearTimeout(
  timeoutID: number
): void;
