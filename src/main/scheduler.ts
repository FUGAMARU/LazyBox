import { RESET_SCORE_BOARD_BOUNDARY_HOUR } from "./constants"
import { storeManager } from "./store-manager"

type Scheduler = {
  initializeScheduler: () => void
}

export const scheduler = (): Scheduler => {
  const { lastUpdated, resetDynamicData } = storeManager()

  const checkShouldResetDynamicData = () => {
    const currentHour = new Date().getHours()

    if (currentHour >= RESET_SCORE_BOARD_BOUNDARY_HOUR) {
      return true
    }

    if (lastUpdated === undefined) return false

    const currentUnixTimestamp = Math.floor(Date.now() / 1000)
    if (currentUnixTimestamp - lastUpdated >= RESET_SCORE_BOARD_BOUNDARY_HOUR * 60 * 60) {
      return true
    }

    return false
  }

  const initializeScheduler = () => {
    // アプリを起動した時に判定時刻を跨いでいた場合はデーターをリセットする
    if (checkShouldResetDynamicData()) {
      resetDynamicData()
    }

    // アプリを起動した状態で判定時刻を迎えた場合にデーターをリセットする
    setInterval(() => {
      const now = new Date()
      if (
        now.getHours() === RESET_SCORE_BOARD_BOUNDARY_HOUR &&
        now.getMinutes() === 0 &&
        now.getSeconds() === 0
      ) {
        resetDynamicData()
      }
    }, 1000)
  }

  return {
    initializeScheduler
  } as const
}
