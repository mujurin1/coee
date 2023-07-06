import { Message, MessageData } from "./Message";

export interface ViewParameters<
  SendControllerData extends MessageData = MessageData,
  SendViewData extends MessageData = MessageData
> extends Omit<g.SceneParameterObject, "game"> {
  local?: "interpolate-local" | "non-local";
  /**
   * DOMが存在しない環境の場合にViewを非活性化させる
   *
   * DOMが存在しない環境はControllerが動作している環境など
   *
   * 非活性化させると {@link View.onLoaded} と {@link View.onMessageData} が呼び出されない\
   * サーバーではViewは不要なため無駄を削減できる
   * @default true
   */
  disableIfDomNotExist?: boolean;
}

/**
 * コントローラにより制御される g.Scene を継承したViewクラス
 *
 * これを継承したクラスはコンストラクタ引数を ViewBase と合わせる必要がある
 *
 * 本シーンを利用した場合、すべての g.MessageEvent がフレームワーク側で握りつぶされる点に注意\
 * また、以下のパラメータの初期値が g.Scene と異なる点に注意
 * * local: "interpolate-local"
 * * tickGenerationMode: "manual"
 */
export abstract class View<
  SendControllerData extends MessageData = MessageData,
  SendViewData extends MessageData = MessageData
> extends g.Scene {
  public readonly disableIfDomNotExist: boolean;
  public readonly generatesTickManually: boolean;

  public constructor(params: ViewParameters<SendControllerData, SendViewData>) {
    super({
      local: "interpolate-local",
      tickGenerationMode: "manual",
      game: g.game,
      ...params
    });

    this.disableIfDomNotExist = params.disableIfDomNotExist ?? true;
    this.generatesTickManually = this.tickGenerationMode === "manual";

    if (g.game.env.domExist || !this.disableIfDomNotExist) {
      this.onMessage.add(this.handleMessageEventReceive, this);
      this.onLoad.addOnce(this.onLoaded, this);
    }
  }

  /**
   * 準備完了時に呼び出される
   */
  protected abstract onLoaded(): void;

  /**
   * `MessageData`を受け取ったら呼び出される
   * @param messageData Message<SendControllerData>
   */
  protected abstract onMessageData(messageData: Message<SendControllerData>): void;

  /**
   * Controller にデータを送信する
   * @param data 送信するデータ
   */
  public send(data: SendViewData, priority?: number): void {
    this.game.raiseEvent(
      new g.MessageEvent({ data } satisfies Message<SendViewData>, undefined, false, priority)
    );
  }

  /**
   * 現在のシーンでエンティティを作成する
   * @param entity 生成するエンティティのクラス
   * @param param
   */
  public createEntity<e extends typeof g.E>(
    entity: e,
    param: Omit<ConstructorParameters<e>[0], "scene">
  ): InstanceType<e> {
    return new entity({
      scene: this,
      ...param
    }) as InstanceType<e>;
  }

  private handleMessageEventReceive(ev?: g.MessageEvent): void {
    if (ev == null || ev.data == null) return;

    const message: Message<SendControllerData> = ev.data;

    if (message.data == null || message.data.type == null) return;

    this.onMessageData(message);
  }

  // override
  public destroy() {
    this.onMessage.remove(this.handleMessageEventReceive, this);

    super.destroy();
  }
}

