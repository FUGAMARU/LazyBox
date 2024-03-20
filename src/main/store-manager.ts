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
  scoreBoardList: ScoreBoard[] | undefined // スコアボード
  nextResetUnixTimestamp: number | undefined // 次回リセット時刻 (Unixタイムスタンプ)
}

export type StoreManager = {
  hasInitialized: boolean
  setNickname: (nickname: string) => void
  addUdpAddress: (address: string) => void
  setKeyCount: (keyCount: number) => void
  setClickCount: (clickCount: number) => void
  updateScoreBoardList: (receivedScoreBoard: ScoreBoard) => void
  resetDynamicData: () => void
  setNextResetUnixTimestamp: (unixTimestamp: number) => void
  getUUID: () => string | undefined
  getNickname: () => string | undefined
  getKeyCount: () => number | undefined
  getClickCount: () => number | undefined
  getGlobalKeyCount: () => number
  getGlobalClickCount: () => number
  getUdpAddresses: () => string[] | undefined
  getScoreBoardList: () => ScoreBoard[] | undefined
  getNextResetUnixTimestamp: () => number | undefined
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

  const getUUID = () => {
    return electronStore.get("uuid")
  }

  const getNickname = () => {
    return electronStore.get("nickname")
  }
  const setNickname = (nickname: string): void => {
    electronStore.set("nickname", nickname)
  }

  const getUdpAddresses = () => {
    return electronStore.get("udpAddresses")
  }
  const addUdpAddress = (address: string): void => {
    const udpAddresses = electronStore.get("udpAddresses")
    if (udpAddresses !== undefined && !udpAddresses.includes(address)) {
      udpAddresses.push(address)
      electronStore.set("udpAddresses", udpAddresses)
    }
  }

  const getKeyCount = () => {
    return electronStore.get("keyCount")
  }
  const setKeyCount = (keyCount: number): void => {
    electronStore.set("keyCount", keyCount)
  }

  const getClickCount = () => {
    return electronStore.get("clickCount")
  }
  const setClickCount = (clickCount: number): void => {
    electronStore.set("clickCount", clickCount)
  }

  const getGlobalKeyCount = (): number => {
    return global.keyCount
  }
  const getGlobalClickCount = (): number => {
    return global.clickCount
  }

  const getScoreBoardList = () => {
    return electronStore.get("scoreBoardList")
  }
  const updateScoreBoardList = (receivedScoreBoard: ScoreBoard): void => {
    const { uuid } = receivedScoreBoard

    const scoreBoardList = getScoreBoardList()

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

  const resetDynamicData = (): void => {
    electronStore.set("keyCount", 0)
    electronStore.set("clickCount", 0)
    electronStore.set("udpAddresses", [])
    electronStore.set("scoreBoardList", [])
    global.keyCount = 0
    global.clickCount = 0
  }

  const getNextResetUnixTimestamp = () => {
    return electronStore.get("nextResetUnixTimestamp")
  }
  const setNextResetUnixTimestamp = (unixTimestamp: number): void => {
    electronStore.set("nextResetUnixTimestamp", unixTimestamp)
  }

  return {
    hasInitialized,
    getUUID,
    getNickname,
    setNickname,
    getUdpAddresses,
    addUdpAddress,
    getKeyCount,
    setKeyCount,
    getClickCount,
    setClickCount,
    getGlobalKeyCount,
    getGlobalClickCount,
    getScoreBoardList,
    updateScoreBoardList,
    resetDynamicData,
    getNextResetUnixTimestamp,
    setNextResetUnixTimestamp
  } as const
}
