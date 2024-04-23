import { ChildProcessWithoutNullStreams, execSync, spawn } from "node:child_process"
import {
  INPUT_MONITORING_PROCESS_PATH_LINUX,
  INPUT_MONITORING_PROCESS_PATH_MACOS,
  INPUT_MONITORING_PROCESS_PATH_WINDOWS
} from "./constants/path"
import { BrowserWindow } from "electron"
import { isMatchingOS } from "./utils/isMatchingOS"
import { StoreManager } from "./store-manager"
import {
  UPDATE_KEY_COUNT_EVENT,
  UPDATE_CLICK_COUNT_EVENT,
  COUNT_SAVE_INTERVAL,
  INPUT_MONITORING_PROCESS_SIGNAL_KEY_UP,
  INPUT_MONITORING_PROCESS_SIGNAL_MOUSE_UP
} from "./constants/value"

type Args = {
  mainWindow: BrowserWindow
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
  getGlobalClickCount
}: Args): InputMonitoringIpc => {
  let inputMonitoringProcess: ChildProcessWithoutNullStreams | undefined = undefined

  const initializeInputMonitoringIpc = (): void => {
    const inputMonitoringProcessPath = isMatchingOS("windows")
      ? INPUT_MONITORING_PROCESS_PATH_WINDOWS
      : isMatchingOS("macos")
        ? INPUT_MONITORING_PROCESS_PATH_MACOS
        : INPUT_MONITORING_PROCESS_PATH_LINUX
    inputMonitoringProcess = spawn(inputMonitoringProcessPath, [], { shell: true })

    const stdout = inputMonitoringProcess.stdout
    if (stdout === null) return

    stdout.on("data", data => {
      const message = data.toString().trim()
      switch (message) {
        case INPUT_MONITORING_PROCESS_SIGNAL_KEY_UP:
          const newKeyCount = getGlobalKeyCount() + 1
          global.keyCount = newKeyCount
          mainWindow.webContents.send(UPDATE_KEY_COUNT_EVENT, newKeyCount)
          break
        case INPUT_MONITORING_PROCESS_SIGNAL_MOUSE_UP:
          const newClickCount = getGlobalClickCount() + 1
          global.clickCount = newClickCount
          mainWindow.webContents.send(UPDATE_CLICK_COUNT_EVENT, newClickCount)
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

    const { pid } = inputMonitoringProcess

    if (pid === undefined) return

    if (isMatchingOS("windows")) {
      execSync(`taskkill /pid ${pid} /f /t`, {
        shell: "powershell.exe"
      }).toString()
    } else {
      process.kill(pid)
    }

    console.log("PROCESS KILLED")
  }

  return {
    initializeInputMonitoringIpc,
    killInputMonitoringProcess
  } as const
}
