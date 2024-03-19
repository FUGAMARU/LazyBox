import { BrowserWindow } from "electron"
import { RESET_SCORE_BOARD_BOUNDARY_HOUR } from "./constants"
import { StoreManager } from "./store-manager"
import { getNextResetUnixTimestamp as getNextResetUnixTimestampFunc } from "./utils/getNextResetUnixTimestamp"

type Args = Pick<
  StoreManager,
  "resetDynamicData" | "getNextResetUnixTimestamp" | "setNextResetUnixTimestamp"
> & {
  mainWindow: BrowserWindow
}

type Scheduler = {
  initializeScheduler: () => void
}

export const scheduler = ({
  resetDynamicData,
  getNextResetUnixTimestamp,
  setNextResetUnixTimestamp,
  mainWindow
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
        resetDynamicData(mainWindow)
        setNextResetUnixTimestamp(calculatedNextResetUnixTimestamp)
      }
    }, 1000)
  }

  return {
    initializeScheduler
  } as const
}
