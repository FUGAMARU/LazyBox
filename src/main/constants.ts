/** キーボード・マウスイベント監視プロセスのappRootから見た時の実行ファイルパス */
const INPUT_MONITORING_PROCESS_BASE_PATH = ["resources", "input_monitoring"]
export const INPUT_MONITORING_PROCESS_PATH_WINDOWS = [
  ...INPUT_MONITORING_PROCESS_BASE_PATH,
  "windows.exe"
]
export const INPUT_MONITORING_PROCESS_PATH_MACOS = [...INPUT_MONITORING_PROCESS_BASE_PATH, "macos"]
export const INPUT_MONITORING_PROCESS_PATH_LINUX = [...INPUT_MONITORING_PROCESS_BASE_PATH, "linux"]

/** UDP通信に使うポート番号 */
export const UDP_PORT = 55865

/** UDPのブロードキャストで送信するメッセージ */
export const UDP_BROADCAST_MESSAGE = "LAZY_BOX_CLIENT"

/** UDPでブロードキャストする間隔 (秒) */
export const UDP_BROADCAST_INTERVAL = 60
