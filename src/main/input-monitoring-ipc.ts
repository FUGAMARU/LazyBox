import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import path from "path"
import { appRoot } from "."
import { INPUT_MONITORING_PROCESS_PATH_WINDOWS } from "./constants"

type InputMonitoringIpc = {
  initializeInputMonitoringIpc: () => void
  killInputMonitoringProcess: () => void
}

/** キーボード・マウスイベント監視プロセスとのIPC通信 (この関数は1箇所からのみ呼び出されることを想定している) */
export const inputMonitoringIpc = (): InputMonitoringIpc => {
  let inputMonitoringProcess: ChildProcessWithoutNullStreams

  const initializeInputMonitoringIpc = (): void => {
    inputMonitoringProcess = spawn(
      path.join(appRoot, ...INPUT_MONITORING_PROCESS_PATH_WINDOWS),
      [],
      {
        shell: true
      }
    )

    inputMonitoringProcess.stdout.on("data", data => {
      const message = data.toString().trim()
      message
    })
  }

  const killInputMonitoringProcess = (): void => {
    inputMonitoringProcess.stdin.write("SHUTDOWN\n")
  }

  return {
    initializeInputMonitoringIpc,
    killInputMonitoringProcess
  } as const
}
