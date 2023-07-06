import { Controller } from "./Controller";
import { View } from "./View";

/**
 * プレイヤー間で送受信するデータの定義
 */
export interface Message<DATA extends MessageData = MessageData> {
  /**
   * プレイヤーID
   *
   * {@link View} から送信した場合はそのクライアントのプレイヤーIDが入る\
   * (送信時にセットしてもControllerで受診時に上書きされる)
   *
   * {@link Controller} から送信する場合は
   * * {@link Controller.broadcast} を使うと `undefined` で送信される
   * * {@link Controller.broadcastAsPlayerId} を使うと任意の値をセット出来る
   *
   */
  readonly playerId?: string;

  /**
   * データ {@link MessageData}
   */
  readonly data: DATA;
}

/**
 * Controller/View 間で送受信するデータ
 */
export interface MessageData {
  /**
   * メッセージの種類. データ毎に一意であるべき
   */
  readonly type: string;
}

/**
 * {@link MessageData} 受信時に実行する
 */
export type MessageAction<Data extends MessageData = MessageData> = (data: Message<Data>) => void;

/**
 * {@link MessageAction} と受け取るデータ名のセット
 */
export interface MessageActionSet<DATA extends MessageData = MessageData> {
  /**
   * 引数で受け取る {@link MessageData} の名前
   */
  readonly type: DATA["type"];
  /**
   * {@link MessageData} を引数に実行する関数
   */
  readonly action: MessageAction<DATA>;
}
