import { BrowserWindow } from "electron"
import {
  RESET_SCORE_BOARD_BOUNDARY_HOUR,
  UPDATE_CLICK_COUNT_EVENT,
  UPDATE_KEY_COUNT_EVENT
} from "./constants"
import { StoreManager } from "./store-manager"
import { getNextResetUnixTimestamp as getNextResetUnixTimestampFunc } from "./utils/getNextResetUnixTimestamp"
import { TrayUtil } from "./tray-util"

type Args = Pick<
  StoreManager,
  | "resetDynamicData"
  | "getNextResetUnixTimestamp"
  | "setNextResetUnixTimestamp"
  | "getGlobalKeyCount"
  | "getGlobalClickCount"
  | "getUUID"
  | "getNickname"
  | "getScoreBoardList"
> &
  Pick<TrayUtil, "updateTrayRanking"> & {
    mainWindow: BrowserWindow
  }

type Scheduler = {
  initializeScheduler: () => void
}

export const scheduler = ({
  resetDynamicData,
  getNextResetUnixTimestamp,
  setNextResetUnixTimestamp,
  mainWindow,
  updateTrayRanking,
  getGlobalKeyCount,
  getGlobalClickCount,
  getUUID,
  getNickname,
  getScoreBoardList
}: Args): Scheduler => {
  const initializeScheduler = () => {
    setInterval(() => {
      const calculatedNextResetUnixTimestamp = getNextResetUnixTimestampFunc(
        RESET_SCORE_BOARD_BOUNDARY_HOUR
      )

      const nextResetUnixTimestamp = getNextResetUnixTimestamp()

      if (nextResetUnixTimestamp === undefined) {
        setNextResetUnixTimestamp(calculatedNextResetUnixTimestamp)
        return
      }

      const currentUnixTimestamp = Math.floor(Date.now() / 1000)
      if (currentUnixTimestamp >= nextResetUnixTimestamp) {
        resetDynamicData()

        // 表示もリセットしてあげる
        mainWindow.webContents.send(UPDATE_KEY_COUNT_EVENT, 0)
        mainWindow.webContents.send(UPDATE_CLICK_COUNT_EVENT, 0)
        updateTrayRanking(
          getGlobalKeyCount(),
          getGlobalClickCount(),
          getUUID(),
          getNickname(),
          getScoreBoardList()
        )

        setNextResetUnixTimestamp(calculatedNextResetUnixTimestamp)
      }
    }, 1000)
  }

  return {
    initializeScheduler
  } as const
}
