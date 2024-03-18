import ElectronStore from "electron-store"
import { generateUUID } from "./utils/generateUUID"

export type ScoreBoard = {
  uuid: string // UUID
  nickname: string // ニックネーム
  keyCount: number // キーボード打鍵数
  clickCount: number // マウスクリック数
}

type Store = {
  uuid: string | undefined // UUID
  nickname: string | undefined // ニックネーム
  keyCount: number | undefined // キーボード打鍵数
  clickCount: number | undefined // マウスクリック数
  udpAddresses: string[] | undefined // UDP送信先アドレス一覧
  lastUpdated: number | undefined // 最終更新日時 (Unixタイムスタンプ)
  scoreBoardList: ScoreBoard[] | undefined // スコアボード
}

type StoreManager = {
  hasInitialized: boolean
  setNickname: (nickname: string) => void
  addUdpAddress: (address: string) => void
  setKeyCount: (keyCount: number) => void
  setClickCount: (clickCount: number) => void
  updateScoreBoardList: (receivedScoreBoard: ScoreBoard) => void
  updateLastUpdatedToCurrentTime: (unixTimestamp: number) => void
  resetDynamicData: () => void
} & Store

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

  const scoreBoardList = electronStore.get("scoreBoardList")
  const updateScoreBoardList = (receivedScoreBoard: ScoreBoard): void => {
    const { uuid } = receivedScoreBoard

    // ここでundefinedチェックしなくても下の処理で吸収できるが、オプショナルチェイニングを使わないために明示的にチェック
    if (scoreBoardList === undefined) {
      electronStore.set("scoreBoardList", [receivedScoreBoard])
      return
    }

    // scoreBoardListに既に同じUUIDのデーターが存在する場合は更新する、存在しない場合は追加する
    const newScoreBoardList = scoreBoardList.map(scoreBoard => {
      if (scoreBoard.uuid === uuid) {
        return receivedScoreBoard
      }
      return scoreBoard
    })

    if (!newScoreBoardList.some(scoreBoard => scoreBoard.uuid === uuid)) {
      newScoreBoardList.push(receivedScoreBoard)
    }

    electronStore.set("scoreBoardList", newScoreBoardList)
  }

  const lastUpdated = electronStore.get("lastUpdated")
  const updateLastUpdatedToCurrentTime = (unixTimestamp: number): void => {
    electronStore.set("lastUpdated", unixTimestamp)
  }

  const resetDynamicData = (): void => {
    electronStore.set("keyCount", 0)
    electronStore.set("clickCount", 0)
    electronStore.set("udpAddresses", [])
    global.keyCount = 0
    global.clickCount = 0
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
    scoreBoardList,
    updateScoreBoardList,
    lastUpdated,
    updateLastUpdatedToCurrentTime,
    resetDynamicData
  } as const
}
