/** キーボード・マウスイベント監視プロセスのappRootから見た時の実行ファイルパス */
const INPUT_MONITORING_PROCESS_BASE_PATH = ["resources", "input_monitoring"]
export const INPUT_MONITORING_PROCESS_PATH_WINDOWS = [
  ...INPUT_MONITORING_PROCESS_BASE_PATH,
  "windows.exe"
]
export const INPUT_MONITORING_PROCESS_PATH_MACOS = [...INPUT_MONITORING_PROCESS_BASE_PATH, "macos"]
export const INPUT_MONITORING_PROCESS_PATH_LINUX = [...INPUT_MONITORING_PROCESS_BASE_PATH, "linux"]
