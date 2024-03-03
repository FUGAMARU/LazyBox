import ElectronStore from "electron-store"
import { generateUUID } from "./utils/generateUUID"

type Store = {
  uuid: string // UUID
  nickname: string // ニックネーム
  keyCount: number // キーボード打鍵数
  clickCount: number // マウスクリック数
  udpAddresses: string[] // UDP送信先アドレス一覧
  lastUpdated: number // 最終更新日時 (Unixタイムスタンプ)
}

type StoreManager = {
  hasInitialized: boolean
  uuid: string | undefined
  nickname: string | undefined
  setNickname: (nickname: string) => void
  addUdpAddress: (address: string) => void
  keyCount: number | undefined
  setKeyCount: (keyCount: number) => void
  clickCount: number | undefined
  setClickCount: (clickCount: number) => void
}

/** 永続化データーの管理 (複数箇所からこの関数を呼び出してOK) */
export const storeManager = (): StoreManager => {
  const electronStore = new ElectronStore<Store>({
    encryptionKey: "ENCRYPTION_KEY"
  })

  if (!electronStore.has("uuid") || electronStore.get("uuid") === "") {
    electronStore.set("uuid", generateUUID())
  }

  const hasInitialized = electronStore.has("uuid") && electronStore.has("nickname")

  const uuid = electronStore.get("uuid")

  const nickname = electronStore.get("nickname")
  const setNickname = (nickname: string): void => {
    electronStore.set("nickname", nickname)
  }

  const addUdpAddress = (address: string): void => {
    const udpAddresses = electronStore.get("udpAddresses")
    if (!udpAddresses.includes(address)) {
      udpAddresses.push(address)
      electronStore.set("udpAddresses", udpAddresses)
    }
  }

  const keyCount = electronStore.get("keyCount")
  const setKeyCount = (keyCount: number): void => {
    electronStore.set("keyCount", keyCount)
  }

  const clickCount = electronStore.get("clickCount")
  const setClickCount = (clickCount: number): void => {
    electronStore.set("clickCount", clickCount)
  }

  return {
    hasInitialized,
    uuid,
    nickname,
    setNickname,
    addUdpAddress,
    keyCount,
    setKeyCount,
    clickCount,
    setClickCount
  } as const
}
