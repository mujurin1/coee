/**
 * 公式の実装のコピペ
 * https://github.com/akashic-games/akashic-engine/blob/main/src/entities/CameraCancellingE.ts
 *
 * カメラのtransformを戻すエンティティ
 *
 * ただしカメラのアンカーが変更されている場合はズレます\
 * 内部のエンティティの当たり判定 (クリック判定) は常にズレています
 */
export class CameraCancellingE extends g.E {
  private _canceller: g.Object2D;

  constructor(param: g.EParameterObject) {
    super(param);
    this._canceller = new g.Object2D();
  }

  /**
   * 公式のデフォルトローディングシーンを参照 (コピペ) \
   * https://github.com/akashic-games/akashic-engine/blob/0a237ad1af42461812871f4801a34380b6d41a96/src/DefaultLoadingScene.ts#L35
   */
  renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
    if (!this.children) return false;

    if (camera && camera instanceof g.Camera2D) {
      var c = <g.Camera2D>camera;
      var canceller = this._canceller;
      if (
        c.x !== canceller.x ||
        c.y !== canceller.y ||
        c.angle !== canceller.angle ||
        c.scaleX !== canceller.scaleX ||
        c.scaleY !== canceller.scaleY
      ) {
        canceller.x = c.x;
        canceller.y = c.y;
        canceller.angle = c.angle;
        canceller.scaleX = c.scaleX;
        canceller.scaleY = c.scaleY;
        if (canceller._matrix) {
          canceller._matrix._modified = true;
        }
      }
      renderer.save();
      renderer.transform(canceller.getMatrix()._matrix);
    }

    // メモの引用 https://github.com/akashic-games/akashic-engine/blob/0a237ad1af42461812871f4801a34380b6d41a96/src/DefaultLoadingScene.ts#L61
    // >> Note: concat していないので unsafe だが, render 中に配列の中身が変わる事はない前提とする
    var children = this.children;
    for (var i = 0; i < children.length; ++i) children[i].render(renderer, camera);

    if (camera != null) {
      renderer.restore();
    }
    return false;
  }
}
