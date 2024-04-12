import { ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import {
  INPUT_MONITORING_PROCESS_PATH_LINUX,
  INPUT_MONITORING_PROCESS_PATH_MACOS,
  INPUT_MONITORING_PROCESS_PATH_WINDOWS,
  INPUT_MONITORING_PROCESS_SIGNALS_PATH
} from "./constants/path"
import { readFileSync } from "node:fs"
import { BrowserWindow } from "electron"
import { isMatchingOS } from "./utils/isMatchingOS"
import { StoreManager } from "./store-manager"
import {
  UPDATE_KEY_COUNT_EVENT,
  UPDATE_CLICK_COUNT_EVENT,
  COUNT_SAVE_INTERVAL
} from "./constants/value"

type Args = {
  mainWindow: BrowserWindow
  onKeyUp: () => void
  onMouseUp: () => void
} & Pick<
  StoreManager,
  "setStoredKeyCount" | "setStoredClickCount" | "getGlobalKeyCount" | "getGlobalClickCount"
>

type InputMonitoringIpc = {
  initializeInputMonitoringIpc: () => void
  killInputMonitoringProcess: () => void
}

/** キーボード・マウスイベント監視プロセスとのIPC通信 (この関数は1箇所からのみ呼び出されることを想定している) */
export const inputMonitoringIpc = ({
  mainWindow,
  setStoredKeyCount,
  setStoredClickCount,
  getGlobalKeyCount,
  getGlobalClickCount,
  onKeyUp,
  onMouseUp
}: Args): InputMonitoringIpc => {
  let inputMonitoringProcess: ChildProcessWithoutNullStreams | undefined = undefined
  let signals: { KEY_UP: string; MOUSE_UP: string; SHUTDOWN: string } | undefined = undefined

  const initializeInputMonitoringIpc = (): void => {
    signals = JSON.parse(readFileSync(INPUT_MONITORING_PROCESS_SIGNALS_PATH, "utf-8"))

    const inputMonitoringProcessPath = isMatchingOS("windows")
      ? INPUT_MONITORING_PROCESS_PATH_WINDOWS
      : isMatchingOS("macos")
        ? INPUT_MONITORING_PROCESS_PATH_MACOS
        : INPUT_MONITORING_PROCESS_PATH_LINUX
    inputMonitoringProcess = spawn(inputMonitoringProcessPath, [], {
      shell: true
    })

    inputMonitoringProcess.stdout.on("data", data => {
      const message = data.toString().trim()

      switch (message) {
        case signals?.KEY_UP:
          const newKeyCount = getGlobalKeyCount() + 1
          global.keyCount = newKeyCount
          mainWindow.webContents.send(UPDATE_KEY_COUNT_EVENT, newKeyCount)
          onKeyUp()
          break
        case signals?.MOUSE_UP:
          const newClickCount = getGlobalClickCount() + 1
          global.clickCount = newClickCount
          mainWindow.webContents.send(UPDATE_CLICK_COUNT_EVENT, newClickCount)
          onMouseUp()
          break
      }
    })

    // キーボードを打鍵したりマウスをクリックする度にファイルに書き込むのは気が引けるので一定間隔で保存する
    setInterval(() => {
      setStoredKeyCount(getGlobalKeyCount())
      setStoredClickCount(getGlobalClickCount())
    }, COUNT_SAVE_INTERVAL * 1000)
  }

  const killInputMonitoringProcess = (): void => {
    if (inputMonitoringProcess === undefined) return
    inputMonitoringProcess.stdin.write(`${signals?.SHUTDOWN}\n`)
  }

  return {
    initializeInputMonitoringIpc,
    killInputMonitoringProcess
  } as const
}
