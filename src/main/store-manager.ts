import ElectronStore from "electron-store"
import { generateUUID } from "./utils/generateUUID"

export type ScoreBoard = {
  uuid: string // UUID
  nickname: string // ニックネーム
  keyCount: number // キーボード打鍵数
  clickCount: number // マウスクリック数
}

type Store = {
  uuid: string // UUID
  nickname: string // ニックネーム
  keyCount: number // キーボード打鍵数
  clickCount: number // マウスクリック数
  udpAddresses: string[] // UDP送信先アドレス一覧
  lastUpdated: number // 最終更新日時 (Unixタイムスタンプ)
  scoreBoard: ScoreBoard[] // スコアボード
}

type StoreManager = {
  hasInitialized: boolean
  uuid: string | undefined
  nickname: string | undefined
  setNickname: (nickname: string) => void
  udpAddresses: string[] | undefined
  addUdpAddress: (address: string) => void
  keyCount: number | undefined
  setKeyCount: (keyCount: number) => void
  clickCount: number | undefined
  setClickCount: (clickCount: number) => void
  setScoreBoard: (scoreBoard: ScoreBoard) => void
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

  const udpAddresses = electronStore.get("udpAddresses")
  const addUdpAddress = (address: string): void => {
    const udpAddresses = electronStore.get("udpAddresses")
    if (udpAddresses !== undefined && !udpAddresses.includes(address)) {
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

  const setScoreBoard = (scoreBoard: ScoreBoard): void => {
    const scoreBoards = electronStore.get("scoreBoard")
    if (scoreBoards !== undefined && scoreBoards.length > 0) {
      const newScoreBoards = scoreBoards.filter(board => board.uuid !== scoreBoard.uuid)
      newScoreBoards.push(scoreBoard)
      electronStore.set("scoreBoard", newScoreBoards)
      return
    }
    electronStore.set("scoreBoard", [scoreBoard])
  }

  return {
    hasInitialized,
    uuid,
    nickname,
    setNickname,
    udpAddresses,
    addUdpAddress,
    keyCount,
    setKeyCount,
    clickCount,
    setClickCount,
    setScoreBoard
  } as const
}
