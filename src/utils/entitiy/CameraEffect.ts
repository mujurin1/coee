/**
 * `g.Camera2D`と同じ効果を子要素に対して行うエンティティ
 */
export class CameraEffect extends g.E {
  constructor(param: g.EParameterObject) {
    super(param);
  }

  render(renderer: g.Renderer, camera?: g.Camera): void {
    // このメソッドはほぼg.Eとg.Cameraの実装まま
    // https://github.com/akashic-games/akashic-engine/blob/4fd5eb2b8d2b658c7ce8167ae95b3e77c47ab5e7/src/entities/E.ts#L376
    // https://github.com/akashic-games/akashic-engine/blob/4fd5eb2b8d2b658c7ce8167ae95b3e77c47ab5e7/src/Camera2D.ts#LL116C13-L116C13

    if (!this.children) return;

    this.state &= ~g.EntityStateFlags.Modified;
    if (this.state & g.EntityStateFlags.Hidden) return;
    if (this.state & g.EntityStateFlags.ContextLess) {
      // カメラの angle, x, y はエンティティと逆方向に作用することに注意。
      renderer.translate(-this.x, -this.y);
      const goDown = this.renderSelf(renderer, camera);
      if (goDown && this.children) {
        const children = this.children;
        const len = children.length;
        for (let i = 0; i < len; ++i) children[i].render(renderer, camera);
      }
      renderer.translate(this.x, this.y);
      return;
    }

    renderer.save();

    if (
      this.angle ||
      this.scaleX !== 1 ||
      this.scaleY !== 1 ||
      this.anchorX !== 0 ||
      this.anchorY !== 0
    ) {
      // Note: this.scaleX/scaleYが0の場合描画した結果何も表示されない事になるが、特殊扱いはしない
      renderer.transform(this.getMatrix()._matrix);
    } else {
      // Note: 変形なしのオブジェクトはキャッシュもとらずtranslateのみで処理
      renderer.translate(-this.x, -this.y);
    }

    if (this.opacity !== 1) renderer.opacity(this.opacity);

    const op = this.compositeOperation;
    if (op != null) {
      renderer.setCompositeOperation(
        typeof op === "string" ? op : g.Util.compositeOperationStringTable[op]
      );
    }

    if (this.shaderProgram && renderer.isSupportedShaderProgram())
      renderer.setShaderProgram(this.shaderProgram);

    // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
    const children = this.children;
    for (let i = 0; i < children.length; ++i) children[i].render(renderer, camera);

    renderer.restore();
  }

  _updateMatrix(): void {
    // g.Cameraの実装まま https://github.com/akashic-games/akashic-engine/blob/4fd5eb2b8d2b658c7ce8167ae95b3e77c47ab5e7/src/Camera2D.ts#LL129C1-L129C1

    if (!this._matrix) return;
    // カメラの angle, x, y はエンティティと逆方向に作用することに注意。
    if (
      this.angle ||
      this.scaleX !== 1 ||
      this.scaleY !== 1 ||
      this.anchorX !== 0 ||
      this.anchorY !== 0
    ) {
      this._matrix.updateByInverse(
        this.width,
        this.height,
        this.scaleX,
        this.scaleY,
        this.angle,
        this.x,
        this.y,
        this.anchorX,
        this.anchorY
      );
    } else {
      this._matrix.reset(-this.x, -this.y);
    }
  }
}
