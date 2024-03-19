/** キーボード・マウスイベント監視プロセスのappRootから見た時の実行ファイルパス */
const INPUT_MONITORING_PROCESS_BASE_PATH = ["resources", "input_monitoring"]
export const INPUT_MONITORING_PROCESS_PATH_WINDOWS = [
  ...INPUT_MONITORING_PROCESS_BASE_PATH,
  "windows.exe"
]
export const INPUT_MONITORING_PROCESS_PATH_MACOS = [...INPUT_MONITORING_PROCESS_BASE_PATH, "macos"]
export const INPUT_MONITORING_PROCESS_PATH_LINUX = [...INPUT_MONITORING_PROCESS_BASE_PATH, "linux"]

/** キーボード・マウスイベント監視プロセスとIPCする時のシグナル定義ファイルのパス */
export const INPUT_MONITORING_PROCESS_SIGNALS_PATH = [
  "resources",
  "input_monitoring",
  "signals.json"
]

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

/** トレイアイコン */
const TRAY_ICON_BASE_PATH = ["resources", "icons"]
export const TRAY_ICON_WINDOWS = [...TRAY_ICON_BASE_PATH, "tray_tmp.ico"]
export const TRAY_ICON_MACOS = [...TRAY_ICON_BASE_PATH, "tray.png"]

/** キーボード打鍵数・マウスクリック・UDP送信先アドレス一覧をリセットする判定境界時刻 (時・24時間表記) */
export const RESET_SCORE_BOARD_BOUNDARY_HOUR = 7

/** ニックネームの保存完了メッセージを表示しておく長さ (秒) */
export const NICKNAME_SAVE_MESSAGE_DURATION = 5

/** キーボード打鍵回数をIPCで送信する時のイベント名 */
export const UPDATE_KEY_COUNT_EVENT = "update-key-count"

/** マウスクリック回数をIPCで送信する時のイベント名 */
export const UPDATE_CLICK_COUNT_EVENT = "update-click-count"
