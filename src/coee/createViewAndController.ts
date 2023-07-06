import { Controller } from "./Controller";
import { MessageData } from "./Message";
import { View } from "./View";

/**
 * ビューとコントローラーを生成します
 * @param createController コントローラーを生成する関数
 * @param createView ビューを生成する関数
 */
export const createViewAndController = <
  SendControllerData extends MessageData,
  SendViewData extends MessageData,
  VIEW extends View<SendControllerData, SendViewData>,
  CONTROLLER extends Controller<SendControllerData, SendViewData>
>(
  createController: (view: VIEW) => CONTROLLER,
  createView: () => VIEW
): readonly [VIEW, CONTROLLER?] => {
  const view = createView();

  if (g.game.isActiveInstance()) {
    return [view, createController(view)];
  }

  return [view];
};
