import { RESET_SCORE_BOARD_BOUNDARY_HOUR } from "./constants"
import { getNextResetUnixTimestamp } from "./utils/getNextResetUnixTimestamp"

type Args = {
  resetDynamicData: () => void
  nextResetUnixTimestamp: number | undefined
  setNextResetUnixTimestamp: (unixTimestamp: number) => void
}

type Scheduler = {
  initializeScheduler: () => void
}

export const scheduler = ({
  resetDynamicData,
  nextResetUnixTimestamp,
  setNextResetUnixTimestamp
}: Args): Scheduler => {
  const initializeScheduler = () => {
    setInterval(() => {
      const calculatedNextResetUnixTimestamp = getNextResetUnixTimestamp(
        RESET_SCORE_BOARD_BOUNDARY_HOUR
      )

      if (nextResetUnixTimestamp === undefined) {
        setNextResetUnixTimestamp(calculatedNextResetUnixTimestamp)
        return
      }

      const currentUnixTimestamp = Math.floor(Date.now() / 1000)
      if (currentUnixTimestamp >= nextResetUnixTimestamp) {
        resetDynamicData()
        setNextResetUnixTimestamp(calculatedNextResetUnixTimestamp)
      }
    }, 1000)
  }

  return {
    initializeScheduler
  } as const
}
