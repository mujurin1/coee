/**
 * 画像元URL(`HTMLImageElement.src`)から画像をダウンロードし`g.ImageData`を返す非同期関数\
 * ニコ生ゲームのサーバ環境では`DOM`が存在しないため画像のサイズが不明なため、サイズの指定が必要になる
 *
 * **※注意※**\
 * サーバー上では画像のビット配列は全てゼロ埋めになる
 * @param imageSrc ニコ生ゲー実行環境の制限により`ak.cdn.nimg.jp`ドメインの画像ダウンロードURL
 * @param width ダウンロードする画像の横幅
 * @param height ダウンロードする画像の縦幅
 * @returns `g.ImageData` {`data: Uint8ClampedArray(RGBA配列),..`}
 * @deprecated 廃止では無いが超非推奨. ニコ生ゲーでのみ使えます. デバッグ環境含むそれ以外の環境では`cross-origin ERROR`
 *
 * @example
 * ```typescript
 * DownloadImage(
 *   "https://ak.cdn.nimg.jp/coe/games/atsumaru/gm22204/1632996763003/files/fcae74c7a81457d40cba.jpg",
 *   1280, 851
 * ).then(imageData => {
 *   const dlImage = createSpriteFromImageData(imageData);
 *   this.display.append(dlImage);
 *   dlImage.onPointDown.addOnce(() => dlImage.remove());
 * });
 * ```
 */
export const DownloadImage = (
  imageSrc: string,
  width: number,
  height: number
): Promise<g.ImageData> => {
  return new Promise((resolve, reject) => {
    const env = g.game.env;

    // ニコ生ゲーの時のサーバー等ではDOMがないため、dataを全て0にして返す
    if (!env.domExist) {
      // `g.ImageData`は`WebAPI`の`ImageData`とは互換性がないため、
      // 下のオブジェクトをそのまま`g.Renderer._putImageData`などに利用すると
      // (`DOM`の`ctx.putImageData`にそのまま利用されるため)エラーが出るが、
      // `DOM`が存在しない環境(サーバ等)では画面に描画しないため問題ない(akashic engine側でいい感じにしてくれる)
      // `DOM`のある環境では`DOM`の`ImageData`を利用できるため、それを利用して生成すると良い
      resolve({
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height
      });
      return;
    }

    const img = new Image();
    // 本番 (ニコ生上) では無い方が良い可能性あり
    // ローカルテスト環境では逆に無いと駄目
    img.crossOrigin = "";
    img.onload = () => {
      const cnv = env.canvas;
      cnv.width = img.width;
      cnv.height = img.height;
      const ctx = cnv.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, width, height));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

/**
 * `g.ImageData`から`g.Sprite`を生成する
 */
export const createSpriteFromImageData = (
  imageData: g.ImageData,
  params: Omit<g.SpriteParameterObject, "src" | "width" | "height">
): g.Sprite => {
  const width = imageData.width;
  const height = imageData.height;
  const surface = g.game.resourceFactory.createSurface(width, height);
  const renderer = surface.renderer();

  // 描画しない (DOMのない) 環境 (ニコ生ゲームでのサーバ等) を除き
  // `renderer._putImageData`の第１引数は`g.ImageData`の仕様を満たすだけでは不十分で
  // 実際にはWebAPIのImageDataである必要がある
  if (g.game.env.domExist && !(imageData instanceof ImageData)) {
    imageData = new ImageData(imageData.data, width);
  }

  // renderer.begin();  これは必要なのか不明
  renderer._putImageData(imageData, 0, 0);
  // renderer.end();    これは必要なのか不明

  return new g.Sprite({
    src: surface,
    width,
    height,
    ...params
  });
};
