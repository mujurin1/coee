/**
 * 座標 (x/y)
 */
export interface Point {
  x: number;
  y: number;
}

export module Point {
  /**
   * 合計した新しい`Point`を返す
   */
  export const sum = (a: Point, b: Point): Point => {
    return {
      x: a.x + b.x,
      y: a.y + b.y
    };
  };

  /**
   * 2つの値が完全に一致するか調べる
   */
  export const equal = (a: Point, b: Point): boolean => {
    return a.x === b.x && a.y === b.y;
  };
}

/**
 * サイズ (width/height)
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 領域 (top/right/bottom/left)
 */
export interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
