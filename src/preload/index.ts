import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"
import { storeManager } from "../main/store-manager"
import { NICKNAME_SAVE_MESSAGE_DURATION } from "../main/constants"

const { uuid, nickname, setNickname } = storeManager()

// Custom APIs for renderer
export const api = {
  uuid,
  nickname,
  setNickname,
  nicknameSaveMessageDuration: NICKNAME_SAVE_MESSAGE_DURATION,
  getKeyCount: (): Promise<number | undefined> => ipcRenderer.invoke("get-key-count"),
  getClickCount: (): Promise<number | undefined> => ipcRenderer.invoke("get-click-count")
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("api", api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
