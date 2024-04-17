import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"
import { storeManager } from "../main/store-manager"
import {
  APP_VERSION,
  NICKNAME_SAVE_MESSAGE_DURATION,
  UPDATE_CLICK_COUNT_EVENT,
  UPDATE_KEY_COUNT_EVENT,
  UPDATE_RANKING_EVENT
} from "../main/constants/value"
import { RankCardData } from "../main/types/RankCardData"

const { getUUID, getNickname, setNickname } = storeManager()

// Custom APIs for renderer
export const api = {
  getUUID,
  getNickname,
  setNickname,
  getRanking: (): Promise<RankCardData> => ipcRenderer.invoke("get-ranking"),
  nicknameSaveMessageDuration: NICKNAME_SAVE_MESSAGE_DURATION,
  getKeyCount: (): Promise<number> => ipcRenderer.invoke("get-key-count"),
  getClickCount: (): Promise<number> => ipcRenderer.invoke("get-click-count"),
  updateKeyCountEventName: UPDATE_KEY_COUNT_EVENT,
  updateClickCountEventName: UPDATE_CLICK_COUNT_EVENT,
  updateRankingEventName: UPDATE_RANKING_EVENT,
  appVersion: APP_VERSION
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
