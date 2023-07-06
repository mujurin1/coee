export interface CanvasDrawerParameterObject extends g.EParameterObject {
  /** キャンバスの幅 */
  width: number;
  /** キャンバスの高さ */
  height: number;
  /** キャンバスを描画する倍率. @default 1 */
  pixelScale?: number;
  /** 描画関数 */
  draw: (ctx: CanvasRenderingContext2D) => void;
}

/**
 * キャンバスに描画する関数を受け取り、描画時にそれを実行する
 */
export class CanvasDrawer extends g.E {
  public readonly widthInPixel: number;
  public readonly heightInPixel: number;

  public readonly pixelScale: number;

  private readonly draw: (ctx: CanvasRenderingContext2D) => void;

  constructor(param: CanvasDrawerParameterObject) {
    const pixelScale = param.pixelScale ?? 1;

    const widthInPixel = param.width;
    const heightInPixel = param.height;

    param.width *= pixelScale;
    param.height *= pixelScale;
    super(param);

    this.draw = param.draw;
    this.widthInPixel = widthInPixel;
    this.heightInPixel = heightInPixel;
    this.pixelScale = pixelScale;
  }

  renderSelf(_renderer: g.Renderer, _camera?: g.Camera | undefined): boolean {
    const value = (<any>_renderer).context;
    // matrix を再計算して貰う
    value.prerender();

    this.draw(value._context);

    return true;
  }
}
