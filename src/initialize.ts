import { DomInfo, Environment, EnvironmentDefault } from "./Environment/Environment";
import { MessageData } from "./coee/Message";

export interface InitializeParam<
  SendControllerData extends MessageData,
  SendViewData extends MessageData
> {
  /** メイン関数の引数 */
  readonly param: g.GameMainParameterObject;
  /**
   * ソロプレイモードで実行するか\
   * {@link EnvironmentDefault.soloMode}
   *
   * default値の条件\
   * true: {@link g.game.isActiveInstance} が `true` かつ {@link g.game.selfId} が `undefined` でない場合のみ\
   * false: それ以外の場合
   **/

  readonly soloMode?: boolean;

  /** 初期化が完了したら呼ばれる */
  readonly initialized: () => void;
}

export const initializeCoee = <
  SendControllerData extends MessageData,
  SendViewData extends MessageData
>(
  params: InitializeParam<SendControllerData, SendViewData>
): void => {
  const {
    initialized,
    param,
    // ホスト環境 & IDが存在するのはソロプレイモードのみ (2023/07/06 現在)
    soloMode = g.game.isActiveInstance() && g.game.selfId != null
  } = params;
  const { snapshot } = param;

  if (snapshot != null) {
    if (snapshot.hostId == null) {
      throw new Error(
        "COEEでスナップショットを利用する場合`g.game.env.requestSaveSnapshotCoee`を利用して下さい"
      );
    }

    _initialize(snapshot.hostId, soloMode);

    initialized();
  }
  // マルチプレイモード (通常 ニコ生ゲームの全員対戦)
  else if (!soloMode) {
    g.game.onJoin.addOnce(ev => {
      _initialize(ev.player.id!, false);
      scene.destroy();

      initialized();
    });

    const scene = new g.Scene({ game: g.game });
    g.game.pushScene(scene);
  }
  // ソロプレイモード (特殊 `akashic export html` した時など)
  else {
    _initialize(g.game.selfId!, true);
    initialized();
  }
};

const _initialize = (hostId: string, soloMode: boolean): void => {
  const envDefault: EnvironmentDefault = {
    hostId,
    isHost: g.game.selfId === hostId,
    get scene() {
      return g.game.scene()!;
    },
    soloMode,
    requestSaveSnapshotCoee: (func, owner) => {
      g.game.requestSaveSnapshot(() => {
        const snapshot = func.call(owner);
        if (snapshot == null) return null;

        snapshot.snapshot.hostId = g.game.env.hostId;

        return snapshot;
      });
    }
  };

  const domInfo: DomInfo =
    typeof document === "undefined"
      ? { domExist: false }
      : {
          domExist: true,
          canvas: document.getElementsByTagName("canvas")[0],
          context: (<any>g.game.renderers[0]).canvasRenderingContext2D
        };

  (<any>g.game.env) = {
    ...envDefault,
    ...domInfo
  } satisfies Environment;
};

