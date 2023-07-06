/**
 * ローカルストレージのAPI郡
 */
export module LocalStorage {
  let _enable = false;
  let _uniqueID: string;

  /** ローカルストレージが利用可能か */
  export const isEnable = () => _enable;

  /**
   * ローカルストレージ利用を申請する
   * @param uniqueId 保存するキー名に付けるゲーム独自の値。２文字以上
   * @returns ローカルストレージ利用可否
   */
  export const init = (uniqueId: string): boolean => {
    if (uniqueId.length < 2)
      throw new Error(`uniqueId は2文字以上にして下さい. uniqueId:${uniqueId}`);

    _uniqueID = uniqueId;
    _enable = localStorageCheck();

    return _enable;
  };

  /**
   * ローカルストレージから値を取得します
   * @param key 読み込む値のキー
   * @returns 取得した値. ローカルストレージが利用不可, 値が無い場合は`null`
   */
  export const get = (key: string): string | null => {
    return _enable ? localStorage.getItem(`${_uniqueID} ${key}`) : null;
  };

  /**
   * ローカルストレージに値をセットします
   * @param key キー
   * @param value 値
   */
  export const set = (key: string, value: string): void => {
    if (_enable) localStorage.setItem(`${_uniqueID} ${key}`, value);
  };

  /**
   * ローカルストレージから値を削除します
   * @param key 削除する値のキー
   */
  export const remove = (key: string): void => {
    if (_enable) localStorage.removeItem(`${_uniqueID} ${key}`);
  };
}

/**
 * ローカルストレージを利用できるなら`LocalStorage.enable`が`true`に設定される\
 * ストレージを利用する前に最初にこのメソッドを呼び出す\
 * ☆５さん(hanakusogame)さんのコードを貰った (勝手に) \
 * https://github.com/hanakusogame/hitball/blob/d23e9f74be5442d26a12a7fbe2099ef525d6f09a/src/Input.ts#L346
 * @returns ローカルストレージを利用できる場合は`true`
 */
const localStorageCheck = (): boolean => {
  try {
    if (typeof window.localStorage !== "undefined") {
      const key = `dummy_key_wqxi`;
      const value = "dummy_value";

      localStorage.setItem(key, value);
      if (localStorage.getItem(key) === value) {
        localStorage.removeItem(key);
        return true;
      }
    }
  } catch {}

  return false;
};
