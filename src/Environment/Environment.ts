declare module "@akashic/akashic-engine/lib" {
  export interface Game {
    /** 環境情報 */
    readonly env: Environment;

    /**
     * **このメソッドはSAC利用時は呼び出し不可**\
     * **代わりに`g.game.env.requestSaveSnapshotCoee`を利用して下さい**
     *
     * スナップショットを保存する。
     *
     * (`saveSnapshot()` と同じ機能だが、インターフェースが異なる。こちらを利用すること。)
     *
     * 引数として与えた関数 `func()` がフレームの終了時に呼び出される。
     * エンジンは、`func()` の返した値に基づいて、実行環境にスナップショットの保存を要求する。
     *
     * 保存されたスナップショットは、必要に応じてゲームの起動時に与えられる。
     * 詳細は `g.GameMainParameterObject` を参照のこと。
     *
     * このメソッドを 1 フレーム中に複数回呼び出した場合、引数に与えた関数 `func()` の呼び出し順は保証されない。
     * (スナップショットはフレームごとに定まるので、1フレーム中に複数回呼び出す必要はない。)
     *
     * @param func フレーム終了時に呼び出す関数。 `SnapshotSaveRequest` を返した場合、スナップショット保存が要求される。
     * @param owner func の呼び出し時に `this` として使われる値。指定しなかった場合、 `undefined` 。
     * @deprecated このライブラリを利用する場合、代わりに {@link g.game.env.requestSaveSnapshotCoee} を利用するべき
     */
    requestSaveSnapshot(func: () => g.SnapshotSaveRequest | null, owner?: any): void;
  }
}

export type Environment = EnvironmentDefault & DomInfo;

export interface EnvironmentDefault {
  /**
   * 生主のID
   */
  readonly hostId: string;
  /**
   * この端末が生主かどうか
   */
  readonly isHost: boolean;
  /**
   * 現在のシーン
   */
  readonly scene: g.Scene;
  /**
   * ソロプレイモードか
   *
   * **ニコ生ゲームの「ランキングゲーム」を判定する値ではありません**\
   * マルチプレイとして作成したゲームもソロプレイとして遊ばれる可能性があります\
   * COEE内部でソロプレイかどうか判定する必要がある場合があるためにこの値が存在します
   */
  readonly soloMode: boolean;

  /**
   * {@link g.game.requestSaveSnapshot} の代わりに利用する\
   * 保存されたデータは`main`関数での引数の`snapshot.userd`に配置される
   * @param func フレーム終了時に呼び出す関数. `undefined` を返した場合スナップショットは保存されない
   * @param owner func の呼び出し時に `this` として使われる値. 指定しなかった場合、 `undefined`
   */
  readonly requestSaveSnapshotCoee: (
    func: () => g.SnapshotSaveRequest | undefined,
    owner?: any
  ) => void;
}

/**
 * DOM に関する状態
 */
export type DomInfo =
  | {
      /** DOMが存在するか */
      readonly domExist: false;
    }
  | {
      /** DOMが存在するか */
      readonly domExist: true;
      /** ゲームが描画されるキャンバス */
      readonly canvas: HTMLCanvasElement;
      /** ゲームが描画されるキャンバスのコンテキスト */
      readonly context: CanvasRenderingContext2D;
    };
