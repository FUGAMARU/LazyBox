import { spawn } from "child_process"
import path from "path"
import { appRoot } from "."
import { INPUT_MONITORING_PROCESS_PATH_WINDOWS } from "./constants"

type IOType = {
  killInputMonitoringProcess: () => void
}

/** キーボード・マウスイベント監視プロセスとのIPC通信 (この関数は1箇所からのみ呼び出されることを想定している) */
export const io = (): IOType => {
  const inputMonitoringProcess = spawn(
    path.join(appRoot, ...INPUT_MONITORING_PROCESS_PATH_WINDOWS),
    [],
    {
      shell: true
    }
  )

  const killInputMonitoringProcess = (): void => {
    inputMonitoringProcess.kill()
  }

  inputMonitoringProcess.stdout.on("data", data => {
    const message = data.toString().trim()
    message
  })

  return {
    killInputMonitoringProcess
  } as const
}
