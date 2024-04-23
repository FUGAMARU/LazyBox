import ElectronStore from "electron-store"
import { generateUUID } from "./utils/generateUUID"
import { generateRankingData } from "./utils/generateRankingData"
import { RankCardData } from "./types/RankCardData"
import { ELECTRON_STORE_ENCRYPTION_KEY, ELECTRON_STORE_KEY } from "./constants/value"
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
  getUdpAddresses: () => string[]
  getScoreBoardList: () => ScoreBoard[]
  getNextResetUnixTimestamp: () => number | undefined
  getRanking: () => RankCardData
}

/** 永続化データーの管理 (複数箇所からこの関数を呼び出してOK) */
export const storeManager = (): StoreManager => {
  const electronStore = new ElectronStore<Store>({
    encryptionKey: ELECTRON_STORE_ENCRYPTION_KEY
  })

  // UUIDが未定義の場合は生成する
  if (
    !electronStore.has(ELECTRON_STORE_KEY.UUID) ||
    electronStore.get(ELECTRON_STORE_KEY.UUID) === ""
  ) {
    electronStore.set(ELECTRON_STORE_KEY.UUID, generateUUID())
  }

  // キー打鍵数・クリック数が未定義の場合は初期値を設定する
  if (
    !electronStore.has(ELECTRON_STORE_KEY.KEY_COUNT) ||
    !electronStore.has(ELECTRON_STORE_KEY.CLICK_COUNT)
  ) {
    electronStore.set(ELECTRON_STORE_KEY.KEY_COUNT, 0)
    electronStore.set(ELECTRON_STORE_KEY.CLICK_COUNT, 0)
  }

  // udpAddressesが未定義の場合は初期値を設定する
  if (!electronStore.has(ELECTRON_STORE_KEY.UDP_ADDRESSES)) {
    electronStore.set(ELECTRON_STORE_KEY.UDP_ADDRESSES, [])
  }

  // scoreBoardListが未定義の場合は初期値を設定する
  if (!electronStore.has(ELECTRON_STORE_KEY.SCORE_BOARD_LIST)) {
    electronStore.set(ELECTRON_STORE_KEY.SCORE_BOARD_LIST, [])
  }

  const hasNickname = electronStore.has(ELECTRON_STORE_KEY.NICKNAME)

  const getUUID = () => {
    return electronStore.get(ELECTRON_STORE_KEY.UUID) as string // 空値チェック後なのでundefinedにはなり得ない
  }

  const getNickname = () => {
    return electronStore.get(ELECTRON_STORE_KEY.NICKNAME)
  }
  const setNickname = (nickname: string): void => {
    electronStore.set(ELECTRON_STORE_KEY.NICKNAME, nickname)
  }

  const getUdpAddresses = () => {
    return electronStore.get(ELECTRON_STORE_KEY.UDP_ADDRESSES)! // 空値チェック後なのでundefinedにはなり得ない
  }
  const addUdpAddress = (address: string): void => {
    const udpAddresses = electronStore.get(ELECTRON_STORE_KEY.UDP_ADDRESSES)! // 空値チェック後なのでundefinedにはなり得ない

    if (!udpAddresses.includes(address)) {
      udpAddresses.push(address)
      electronStore.set(ELECTRON_STORE_KEY.UDP_ADDRESSES, udpAddresses)
    }
  }

  const getStoredKeyCount = () => {
    return electronStore.get(ELECTRON_STORE_KEY.KEY_COUNT) as number
  }
  const setStoredKeyCount = (keyCount: number): void => {
    electronStore.set(ELECTRON_STORE_KEY.KEY_COUNT, keyCount)
  }

  const getStoredClickCount = () => {
    return electronStore.get(ELECTRON_STORE_KEY.CLICK_COUNT) as number
  }
  const setStoredClickCount = (clickCount: number): void => {
    electronStore.set(ELECTRON_STORE_KEY.CLICK_COUNT, clickCount)
  }

  const getGlobalKeyCount = (): number => {
    return global.keyCount ?? 0
  }
  const getGlobalClickCount = (): number => {
    return global.clickCount ?? 0
  }

  const getScoreBoardList = () => {
    return electronStore.get(ELECTRON_STORE_KEY.SCORE_BOARD_LIST)! // 空値チェック後なのでundefinedにはなり得ない
  }
  const updateScoreBoardList = (receivedScoreBoard: ScoreBoard): void => {
    const { uuid } = receivedScoreBoard

    const scoreBoardList = getScoreBoardList()

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

    electronStore.set(ELECTRON_STORE_KEY.SCORE_BOARD_LIST, newScoreBoardList)
  }

  const resetDynamicData = (): void => {
    electronStore.set(ELECTRON_STORE_KEY.KEY_COUNT, 0)
    electronStore.set(ELECTRON_STORE_KEY.CLICK_COUNT, 0)
    electronStore.set(ELECTRON_STORE_KEY.UDP_ADDRESSES, [])
    electronStore.set(ELECTRON_STORE_KEY.SCORE_BOARD_LIST, [])
    global.keyCount = 0
    global.clickCount = 0
  }

  const getNextResetUnixTimestamp = () => {
    return electronStore.get(ELECTRON_STORE_KEY.NEXT_RESET_UNIX_TIMESTAMP)
  }
  const setNextResetUnixTimestamp = (unixTimestamp: number): void => {
    electronStore.set(ELECTRON_STORE_KEY.NEXT_RESET_UNIX_TIMESTAMP, unixTimestamp)
  }

  const getRanking = (): RankCardData => {
    const uuid = getUUID()
    const nickname = getNickname()
    const scoreBoardList = getScoreBoardList()

    if (scoreBoardList.length === 0)
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
