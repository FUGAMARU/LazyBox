import ElectronStore from "electron-store"
import { generateUUID } from "./utils/generateUUID"
import { generateRankingData } from "./utils/generateRankingData"
import { RankCardData } from "./types/RankCardData"
import { ELECTRON_STORE_ENCRYPTION_KEY } from "./constants/value"
import { ensureNickname } from "./utils/ensureNickname"

export type ScoreBoard = {
  uuid: string // UUID
  nickname: string // ニックネーム
  keyCount: number // キーボード打鍵数
  clickCount: number // マウスクリック数
}

type Store = {
  uuid: string // UUID
  nickname: string | undefined // ニックネーム
  keyCount: number // キーボード打鍵数
  clickCount: number // マウスクリック数
  udpAddresses: string[] | undefined // UDP送信先アドレス一覧
  scoreBoardList: ScoreBoard[] | undefined // スコアボード
  nextResetUnixTimestamp: number | undefined // 次回リセット時刻 (Unixタイムスタンプ)
}

export type StoreManager = {
  hasNickname: boolean
  setNickname: (nickname: string) => void
  addUdpAddress: (address: string) => void
  setStoredKeyCount: (keyCount: number) => void
  setStoredClickCount: (clickCount: number) => void
  updateScoreBoardList: (receivedScoreBoard: ScoreBoard) => void
  resetDynamicData: () => void
  setNextResetUnixTimestamp: (unixTimestamp: number) => void
  getUUID: () => string
  getNickname: () => string | undefined
  getStoredKeyCount: () => number
  getStoredClickCount: () => number
  getGlobalKeyCount: () => number
  getGlobalClickCount: () => number
  getUdpAddresses: () => string[] | undefined
  getScoreBoardList: () => ScoreBoard[] | undefined
  getNextResetUnixTimestamp: () => number | undefined
  getRanking: () => RankCardData
}

/** 永続化データーの管理 (複数箇所からこの関数を呼び出してOK) */
export const storeManager = (): StoreManager => {
  const electronStore = new ElectronStore<Store>({
    encryptionKey: ELECTRON_STORE_ENCRYPTION_KEY
  })

  if (!electronStore.has("uuid") || electronStore.get("uuid") === "") {
    electronStore.set("uuid", generateUUID())
  }

  if (!electronStore.has("keyCount") || !electronStore.has("clickCount")) {
    electronStore.set("keyCount", 0)
    electronStore.set("clickCount", 0)
  }

  const hasNickname = electronStore.has("nickname")

  const getUUID = () => {
    return electronStore.get("uuid") as string // 空値チェック後なのでundefinedにはなり得ない
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

  const getStoredKeyCount = () => {
    return electronStore.get("keyCount") as number
  }
  const setStoredKeyCount = (keyCount: number): void => {
    electronStore.set("keyCount", keyCount)
  }

  const getStoredClickCount = () => {
    return electronStore.get("clickCount") as number
  }
  const setStoredClickCount = (clickCount: number): void => {
    electronStore.set("clickCount", clickCount)
  }

  const getGlobalKeyCount = (): number => {
    return global.keyCount ?? 0
  }
  const getGlobalClickCount = (): number => {
    return global.clickCount ?? 0
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

  const getRanking = (): RankCardData => {
    const uuid = getUUID()
    const nickname = getNickname()
    const scoreBoardList = getScoreBoardList()

    if (scoreBoardList === undefined || scoreBoardList.length === 0)
      return {
        current: 0,
        total: 0
      }

    const rankingData = generateRankingData(
      getGlobalKeyCount(),
      getGlobalClickCount(),
      uuid,
      ensureNickname(nickname, "myself"),
      scoreBoardList
    )

    const myRanking = rankingData.findIndex(data => data.uuid === uuid) + 1
    const totalRanking = rankingData.length

    return {
      current: myRanking,
      total: totalRanking
    }
  }

  return {
    hasNickname,
    getUUID,
    getNickname,
    setNickname,
    getUdpAddresses,
    addUdpAddress,
    getStoredKeyCount,
    setStoredKeyCount,
    getStoredClickCount,
    setStoredClickCount,
    getGlobalKeyCount,
    getGlobalClickCount,
    getScoreBoardList,
    updateScoreBoardList,
    resetDynamicData,
    getNextResetUnixTimestamp,
    setNextResetUnixTimestamp,
    getRanking
  } as const
}
