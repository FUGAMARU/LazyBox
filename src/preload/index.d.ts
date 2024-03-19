import { api } from "./index"
import { ElectronAPI } from "@electron-toolkit/preload"

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof api
    nicknameInputValue: string
    nicknameSaveMessageDuration: number
  }
}
