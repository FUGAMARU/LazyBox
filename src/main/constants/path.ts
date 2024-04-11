import { is } from "@electron-toolkit/utils"
import path from "node:path"

/** Resourceフォルダーのパス */
const RESOURCE_FOLDER_PATH = is.dev
  ? path.join(__dirname, "/../../resources")
  : path.join(process.resourcesPath, "/resources")

/** キーボード・マウスイベント監視プロセスの実行ファイルパス */
const INPUT_MONITORING_PROCESS_BASE_PATH = path.join(RESOURCE_FOLDER_PATH, "/input_monitoring")
export const INPUT_MONITORING_PROCESS_PATH_WINDOWS = path.join(
  INPUT_MONITORING_PROCESS_BASE_PATH,
  "/windows.exe"
)
export const INPUT_MONITORING_PROCESS_PATH_MACOS = path.join(
  INPUT_MONITORING_PROCESS_BASE_PATH,
  "/macos"
)
export const INPUT_MONITORING_PROCESS_PATH_LINUX = path.join(
  INPUT_MONITORING_PROCESS_BASE_PATH,
  "/linux"
)

/** キーボード・マウスイベント監視プロセスとIPCする時のシグナル定義ファイルのパス */
export const INPUT_MONITORING_PROCESS_SIGNALS_PATH = path.join(
  INPUT_MONITORING_PROCESS_BASE_PATH,
  "/signals.json"
)

/** トレイアイコン */
const ICON_BASE_PATH = path.join(RESOURCE_FOLDER_PATH, "/icons")
export const TRAY_ICON_WINDOWS = path.join(ICON_BASE_PATH, "/tray.ico")
export const TRAY_ICON_MACOS = path.join(ICON_BASE_PATH, "/tray.png")
