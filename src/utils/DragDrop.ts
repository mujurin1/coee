interface DropedEvent {
  /** ドロップされた時のイベント */
  drop: (e: DragEvent) => void;
  /** ドラッグ中に上を通った時のイベント */
  dragover: (e: DragEvent) => void;
}

/**
 * ドラッグドロップのAPI郡
 */
export module DragDrop {
  let _dropedEvent: DropedEvent | undefined;

  /**
   * ドラッグドロップを受け付けます\
   * 既に登録されているイベントがある場合、上書きされます
   *
   * DOMが存在しない環境ではイベントは受け付けない\
   * [`dropEffect`について](https://developer.mozilla.org/ja/docs/Web/API/DataTransfer/dropEffect)
   * @param dropedEvent ドロップされたときに呼ばれる関数
   * @param dropEffect マウスオーバー時のドロップエフェクト
   */
  export const hookDragDropEvent = (
    dropedEvent: (e: DragEvent) => void,
    dropEffect?: "none" | "copy" | "link" | "move"
  ): void => {
    if (!g.game.env.domExist) return;

    const canvas = g.game.env.canvas;

    _dropedEvent = {
      drop: dropedEvent,
      dragover: (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropEffect && e.dataTransfer) {
          e.dataTransfer.dropEffect = dropEffect;
        }
      }
    };

    canvas.addEventListener("dragover", _dropedEvent.dragover);
    canvas.addEventListener("drop", _dropedEvent.drop);
  };

  /**
   * ドラッグアンドドロップ受け付けを解除する
   */
  export const unhookDragDropEvent = (): void => {
    if (_dropedEvent == null) return;
    if (!g.game.env.domExist) return;

    const canvas = g.game.env.canvas;

    canvas.removeEventListener("dragover", _dropedEvent.dragover);
    canvas.removeEventListener("drop", _dropedEvent.drop);

    _dropedEvent = undefined;
  };

  /**
   * ドラッグドロップ経由でデータを取得します
   * (`hookDragDropEvent` のラップメソッド)
   *
   * すでにドラッグドロップイベントが登録されている場合はそれを解除します
   *
   * ドラッグドロップイベントが不要になった場合は\
   * `unhookDragDropEvent()`を呼び出してください
   *
   * [`DataTransfer`について](https://developer.mozilla.org/ja/docs/Web/API/DataTransfer)
   *
   * @param droped ドラッグされたデータを受け取る関数
   *
   * @example
   * ```typescript
   * dragDropedFile(data => {
   *   console.log(data.types); // ["Files"] | ['text/plain', 'text/uri-list'] | ...
   *   console.log(`Items: ${data.items.length}`);
   *
   *   for (let i = 0; i < data.items.length; i++) {
   *     const item = data.items[i];
   *     if (item.kind === "string")
   *       data.items[i].getAsString(str => console.log(`${i}: ${str}`));
   *     else {
   *       const file = item.getAsFile();
   *       if (file == null) console.log(`${i}: null`);
   *       else console.log(`${i}:  NAME:${file.name}, TYPE:${file.type}, SIZE:${file.size}`);
   *     }
   *   }
   *
   *   // 以下は上記の item.getAsFile() と同じ内容を取得する。簡易版ファイル取得
   *   console.log(`Files: ${data.files.length}`);
   *   for (let i = 0; i < data.files.length; i++) console.log(data.files[i]);
   * });
   * ```
   */
  export const dragDropedFile = (droped: (data: DataTransfer) => void): void => {
    unhookDragDropEvent();
    hookDragDropEvent(dragEvent => {
      dragEvent.stopPropagation();
      dragEvent.preventDefault();
      if (dragEvent.dataTransfer != null) droped(dragEvent.dataTransfer);
    }, "copy");
  };
}
