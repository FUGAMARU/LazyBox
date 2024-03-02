import ElectronStore from "electron-store"
import { generateUUID } from "./utils/generateUUID"

type ElectronStoreType = {
  uuid: string // UUID
  nickname: string // ニックネーム
  keycount: number // キーボード打鍵数
  clickcount: number // マウスクリック数
  udpAddresses: string[] // UDP送信先アドレス一覧
  lastUpdated: number // 最終更新日時 (Unixタイムスタンプ)
}

const electronStore = new ElectronStore<ElectronStoreType>({
  encryptionKey: "ENCRYPTION_KEY"
})

type StoreType = {
  hasInitialized: boolean
  uuid: string
  nickname: string
  setNickname: (nickname: string) => void
}

export const store = (): StoreType => {
  if (!electronStore.has("uuid") || electronStore.get("uuid") === "") {
    electronStore.set("uuid", generateUUID())
  }

  const hasInitialized = electronStore.has("uuid") && electronStore.has("nickname")

  const uuid = electronStore.get("uuid")
  const nickname = electronStore.get("nickname")
  const setNickname = (nickname: string): void => {
    electronStore.set("nickname", nickname)
  }

  return {
    hasInitialized,
    uuid,
    nickname,
    setNickname
  }
}
