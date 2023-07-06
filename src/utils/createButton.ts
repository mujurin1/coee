import { Label, LabelParameterObject } from "@akashic-extension/akashic-label";
import { createFont } from "./createFont";
import { Rect, Point } from "./Common";

const defaultFont = createFont({ size: 65, fontColor: "white" });

export interface FrameAsset {
  /** 描画元の`g.Surface`アセット名 */
  readonly imageAssetName: string;
  /** 上下左右の「拡大しない」領域の大きさ */
  readonly borderWidth: Readonly<Rect>;
  /** 文字のマージンサイズ */
  readonly margin: Readonly<Rect>;
}

export interface FramelabelParam
  extends Omit<LabelParameterObject, "widthAutoAdjust" | "font" | "width" | "height"> {
  /** 装飾する枠 */
  frame: FrameAsset;
  /** 文字のマージン幅. @default `frame.margine` */
  margin?: Rect;
  /** 描画に利用されるフォント */
  font?: g.Font;
  /** ボタンの幅. 指定しない場合は自動調節される */
  width?: number;
  /** ボタンの高さ. 指定しない場合は自動調節される */
  height?: number;

  // LabelParameter にはないオプション
  /** テキストの位置調整 */
  textMargin?: Point;
}

/**
 * `g.Label`が子に存在する`g.Sprite`を作成する
 * @returns `g.Sprite`
 */
export const createButton = (param: FramelabelParam): g.Sprite => {
  const margin = param.margin ?? param.frame.margin;

  const label = new Label({
    scene: param.scene,
    x: margin.left,
    y: margin.top,
    widthAutoAdjust: true,
    width: param.width ?? 0,
    height: param.height,
    text: param.text,
    textAlign: param.textAlign,
    textColor: param.textColor,
    font: param.font ?? defaultFont,
    fontSize: param.fontSize,
    lineBreak: param.lineBreak,
    lineGap: param.lineGap,
    fixLineGap: param.fixLineGap,
    trimMarginTop: param.trimMarginTop,
    rubyEnabled: param.rubyEnabled,
    rubyOptions: param.rubyOptions,
    rubyParser: param.rubyParser,
    lineBreakRule: param.lineBreakRule
  });

  let width = label.width;
  let height = label.height;
  //#region 描画結果を元にLabel.textが中央になるように計算する
  if (param.width != null) {
    width = param.width - margin.left - margin.right;
    label.x += (width - label.width) / 2;
  }
  if (param.height != null) {
    height = param.height - margin.top - margin.bottom;
    label.y += (height - label.height) / 2;
  }

  if (param.textMargin != null) {
    label.x += param.textMargin.x;
    label.y += param.textMargin.y;
  }

  label.modified();

  width += margin.left + margin.right;
  height += margin.top + margin.bottom;
  //#endregion 描画結果を元にLabel.textが中央になるように計算する

  // 描画先のSurface
  const destSurface = g.game.resourceFactory.createSurface(width, height);
  g.SurfaceUtil.drawNinePatch(
    destSurface,
    getSurface(param.frame.imageAssetName),
    param.frame.borderWidth
  );

  const sprite = new g.Sprite({
    ...param,
    src: destSurface,
    height: undefined,
    width: undefined
  });

  sprite.append(label);
  return sprite;
};

const _surfaceCache: Record<string, g.Surface> = {};

const getSurface = (assetName: string): g.Surface => {
  let surface = _surfaceCache[assetName];

  if (surface == null) {
    surface = g.SurfaceUtil.asSurface(g.game.scene()!.asset.getImageById(assetName))!;
    _surfaceCache[assetName] = surface;
  }

  return surface;
};
