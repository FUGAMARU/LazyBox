import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import path from "path"
import { appRoot } from "."
import {
  COUNT_SAVE_INTERVAL,
  INPUT_MONITORING_PROCESS_PATH_LINUX,
  INPUT_MONITORING_PROCESS_PATH_MACOS,
  INPUT_MONITORING_PROCESS_PATH_WINDOWS,
  INPUT_MONITORING_PROCESS_SIGNALS_PATH
} from "./constants"
import { readFileSync } from "fs"
import { BrowserWindow } from "electron"
import { isMatchingOS } from "./utils/isMatchingOS"
import { StoreManager } from "./store-manager"

type Args = {
  mainWindow: BrowserWindow
} & Pick<StoreManager, "keyCount" | "setKeyCount" | "clickCount" | "setClickCount">

type InputMonitoringIpc = {
  initializeInputMonitoringIpc: () => void
  killInputMonitoringProcess: () => void
}

/** キーボード・マウスイベント監視プロセスとのIPC通信 (この関数は1箇所からのみ呼び出されることを想定している) */
export const inputMonitoringIpc = ({
  mainWindow,
  keyCount,
  setKeyCount,
  clickCount,
  setClickCount
}: Args): InputMonitoringIpc => {
  let inputMonitoringProcess: ChildProcessWithoutNullStreams | undefined = undefined
  let signals: { KEY_UP: string; MOUSE_UP: string; SHUTDOWN: string } | undefined = undefined

  global.keyCount = keyCount ?? 0
  global.clickCount = clickCount ?? 0

  const initializeInputMonitoringIpc = (): void => {
    signals = JSON.parse(
      readFileSync(path.join(appRoot, ...INPUT_MONITORING_PROCESS_SIGNALS_PATH), "utf-8")
    )

    const inputMonitoringProcessPath = isMatchingOS("windows")
      ? INPUT_MONITORING_PROCESS_PATH_WINDOWS
      : isMatchingOS("macos")
        ? INPUT_MONITORING_PROCESS_PATH_MACOS
        : INPUT_MONITORING_PROCESS_PATH_LINUX
    inputMonitoringProcess = spawn(path.join(appRoot, ...inputMonitoringProcessPath), [], {
      shell: true
    })

    inputMonitoringProcess.stdout.on("data", data => {
      const message = data.toString().trim()
      switch (message) {
        case signals?.KEY_UP:
          const newKeyCount = global.keyCount + 1
          global.keyCount = newKeyCount
          mainWindow.webContents.send("update-key-count", newKeyCount)
          break
        case signals?.MOUSE_UP:
          const newClickCount = global.clickCount + 1
          global.clickCount = newClickCount
          mainWindow.webContents.send("update-click-count", newClickCount)
          break
      }
    })

    // キーボードを打鍵したりマウスをクリックする度にファイルに書き込むのは気が引けるので一定間隔で保存する
    setInterval(() => {
      setKeyCount(global.keyCount)
      setClickCount(global.clickCount)
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
