/** アプリバージョン */
export const APP_VERSION = "0.3.0"

/** UDP通信に使うポート番号 */
export const UDP_PORT = 55865

/** UDPのブロードキャストで送信するメッセージ */
export const UDP_BROADCAST_MESSAGE = "LAZY_BOX_CLIENT"

/** UDPのデーターを送信する時の識別符号 */
export const UDP_IDENTIFIER = "LAZY_BOX_SIGNAL"

/** UDPでブロードキャストする間隔 (秒) */
export const UDP_BROADCAST_INTERVAL = 300

/** UDPでキーボード打鍵数・マウスクリック数を送信する間隔 (秒) */
export const UDP_SEND_COUNT_INTERVAL = 60

/** キーボード打鍵数・マウスクリック数を保存する間隔 (秒) */
export const COUNT_SAVE_INTERVAL = 5

/** キーボード打鍵数・マウスクリック・UDP送信先アドレス一覧をリセットする判定境界時刻 (時・24時間表記) */
export const RESET_SCORE_BOARD_BOUNDARY_HOUR = 7

/** ニックネームの保存完了メッセージを表示しておく長さ (秒) */
export const NICKNAME_SAVE_MESSAGE_DURATION = 5

/** キーボード打鍵回数をIPCで送信する時のイベント名 */
export const UPDATE_KEY_COUNT_EVENT = "update-key-count"

/** マウスクリック回数をIPCで送信する時のイベント名 */
export const UPDATE_CLICK_COUNT_EVENT = "update-click-count"

/** 順位をIPCで送信する時のイベント名 */
export const UPDATE_RANKING_EVENT = "update-ranking"

/** electron-storeのデーター暗号化鍵文字列 */
export const ELECTRON_STORE_ENCRYPTION_KEY = "ENCRYPTION_KEY"

/** 入力監視のIPCで使うキーアップのシグナル */
export const INPUT_MONITORING_PROCESS_SIGNAL_KEY_UP = "KEY_UP"

/** 入力監視のIPCで使うマウスアップのシグナル */
export const INPUT_MONITORING_PROCESS_SIGNAL_MOUSE_UP = "MOUSE_UP"
