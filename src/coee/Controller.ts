import * as pl from "@akashic/playlog";
import { Message, MessageData } from "./Message";
import { View } from "./View";

interface BroadcastDataBuffer<DATA extends MessageData> {
  message: Message<DATA>;
  priority: number;
}

export abstract class Controller<
  SendControllerData extends MessageData = MessageData,
  SendViewData extends MessageData = MessageData
> {
  /**
   * Controller と紐づく View
   */
  protected view: View<SendControllerData, SendViewData>;

  public get onUpdate() {
    return this.view.onUpdate;
  }

  /** `this.broadcast.bind(this)` */
  protected broadcast_bound = this.broadcast.bind(this);

  private timerManager: g.TimerManager;
  private broadcastDataBuffer: BroadcastDataBuffer<SendControllerData>[] = [];

  private _sentInitialEvents: boolean = false;
  private handleEventFilter_bound = this.handleEventFilter.bind(this);
  private byClockModeBroadcastEventFilter_bound = this.byClockModeBroadcastEventFilter.bind(this);

  constructor(view: View<SendControllerData, SendViewData>) {
    this.view = view;

    this.timerManager = new g.TimerManager(this.onUpdate, g.game.fps);

    // イベントフィルター関連
    this.view.onStateChange.add(this.handleStateChange, this);

    if (this.view.generatesTickManually) {
      this.view.onUpdate.add(this.raiseTickIfMessageEventExists, this);
    }

    this.view.onLoad.addOnce(this.onLoaded, this);
  }

  /**
   * 準備完了時に呼び出される
   */
  protected abstract onLoaded(): void;

  /**
   * {@link MessageData} を受け取ったら呼び出される
   * @param messageData {@link Message<SendViewData>}
   */
  protected abstract onMessageData(message: Message<SendViewData>): void;

  /**
   * View にデータをブロードキャストする
   * @param data プロードキャストするデータ
   * @param priority プライオリティ省略時は 0
   */
  public broadcast(data: SendControllerData, priority: number = 0): void {
    this.broadcastDataBuffer.push({ message: { data }, priority });
  }

  /**
   * プレイヤーIDを指定して View にデータをブロードキャストする
   * @param data プロードキャストするデータ
   * @param playerId プレイヤーID
   * @param priority プライオリティ省略時は 0
   */
  public broadcastAsPlayerId(
    data: SendControllerData,
    playerId: string,
    priority: number = 0
  ): void {
    this.broadcastDataBuffer.push({ message: { data, playerId }, priority });
  }

  public destroy(): void {
    if (!this.view.destroyed()) {
      this.view.destroy();
    }
    this.view = undefined!;

    this.timerManager.destroy();
    this.timerManager = undefined!;
    this.broadcastDataBuffer = undefined!;
    this.broadcast_bound = undefined!;

    g.game.removeEventFilter(this.handleEventFilter_bound);
    this.handleEventFilter_bound = undefined!;
  }

  //#region タイマー関連
  public setTimeout(func: () => void, duration: number, owner?: any): g.TimerIdentifier {
    return this.timerManager.setTimeout(func, duration, owner);
  }

  public setInterval(func: () => void, interval: number, owner?: any): g.TimerIdentifier {
    return this.timerManager.setInterval(func, interval, owner);
  }

  public clearTimeout(id: g.TimerIdentifier): void {
    this.timerManager.clearTimeout(id);
  }

  public clearInterval(id: g.TimerIdentifier): void {
    this.timerManager.clearInterval(id);
  }
  //#endregion タイマー関連

  //#region イベントフィルター関連
  private getBroadcastDataBuffer(): BroadcastDataBuffer<SendControllerData>[] {
    return this.broadcastDataBuffer.splice(0);
  }

  private byClockModeBroadcastEventFilter(
    events: pl.Event[],
    { processNext }: g.EventFilterController
  ): pl.Event[] {
    const buffer = this.getBroadcastDataBuffer() //
      .map<pl.Event>(({ message, priority }) => [0x20, priority, null, message]);

    if (this._sentInitialEvents) return [...buffer, ...events];

    // NOTE: 手動進行->自動進行切替時に自動進行の開始時刻が不明となってしまうため、シーンの切替時に timestamp を挿入する
    this._sentInitialEvents = true;

    return [
      [0x2, null!, null, Math.floor(g.game.getCurrentTime())], //
      ...buffer,
      ...events
    ];
  }

  private handleEventFilter(
    events: pl.Event[],
    { processNext }: g.EventFilterController
  ): pl.Event[] {
    const filtered: pl.Event[] = [];

    for (const event of events) {
      const [eventCode /*eventFlag*/, , playerId] = event;

      // COEのプラグインに関連するコード
      // if (this.lockingProcessingMessageEvent) {
      //   processNext(event);
      //   continue;
      // }

      if (eventCode === 0x20) {
        const message: Message<SendViewData> = event[3];
        if (message != null && message.data != null) {
          (<any>message.playerId) = playerId;

          this.onMessageData(message);
        }
      } else {
        filtered.push(event);
      }
    }

    return filtered;
  }

  private raiseTickIfMessageEventExists(): void {
    const buffer = this.getBroadcastDataBuffer();
    if (buffer.length === 0) return;

    const events = buffer.map(
      ({ message, priority }) => new g.MessageEvent(message, undefined, undefined, priority)
    );
    const timestamp = new g.TimestampEvent(Math.floor(g.game.getCurrentTime()), null as any);
    g.game.raiseTick([timestamp, ...events]);
  }

  private handleStateChange(state?: g.SceneStateString): void {
    if (state === "deactive") {
      g.game.removeEventFilter(this.handleEventFilter_bound);

      if (!this.view.generatesTickManually) {
        g.game.removeEventFilter(this.byClockModeBroadcastEventFilter_bound);
      }
    } else if (state === "active") {
      // 追加する順番は必ず handleEventFilter が先！
      g.game.addEventFilter(this.handleEventFilter_bound, false);
      if (!this.view.generatesTickManually) {
        g.game.addEventFilter(this.byClockModeBroadcastEventFilter_bound, true);
      }
      this._sentInitialEvents = false;
    }
  }
  //#endregion イベントフィルター関連
}

