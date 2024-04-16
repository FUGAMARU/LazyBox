import { Tray, Menu, app, MenuItemConstructorOptions, nativeTheme } from "electron"
import { isMatchingOS } from "./utils/isMatchingOS"
import { ScoreBoard } from "./store-manager"
import { generateRankingData } from "./utils/generateRankingData"
import { TRAY_ICON_WINDOWS, TRAY_ICON_MACOS_DARK, TRAY_ICON_MACOS_LIGHT } from "./constants/path"
import { is } from "@electron-toolkit/utils"

type Args = {
  showWindow: () => void
  killInputMonitoringProcess: () => void
}

export type TrayUtil = {
  initializeTrayUtil: () => void
  updateTrayRanking: (
    myKeyCount: number,
    myClickCount: number,
    myUUID: string,
    myNickname: string,
    scoreBoardList: ScoreBoard[]
  ) => void
}

export const trayUtil = ({ showWindow, killInputMonitoringProcess }: Args): TrayUtil => {
  let tray: Tray | undefined = undefined
  let currentRankingMenuItems: MenuItemConstructorOptions[] = []

  const initializeTrayUtil = (): void => {
    const trayIcon = isMatchingOS("windows")
      ? TRAY_ICON_WINDOWS
      : nativeTheme.shouldUseDarkColors
        ? TRAY_ICON_MACOS_DARK
        : TRAY_ICON_MACOS_LIGHT
    tray = new Tray(trayIcon)
    tray.setToolTip("LazyBox")
    tray.on("click", () => {
      if (isMatchingOS("windows")) showWindow()
    })
  }

  const handleToggleOpenAtLogin = (): void => {
    if (is.dev) return

    const { openAtLogin } = app.getLoginItemSettings()
    app.setLoginItemSettings({ openAtLogin: !openAtLogin })

    updateTrayData(currentRankingMenuItems)
  }

  const updateTrayData = (rankingMenuItems: MenuItemConstructorOptions[]): void => {
    const commonContextMenuFirstHalf = [
      { type: "normal", label: "LazyBoxを開く", click: () => showWindow() },
      { type: "separator" }
    ] as const satisfies MenuItemConstructorOptions[]

    const { openAtLogin } = app.getLoginItemSettings()

    const commonContextMenuSecondHalf = [
      { type: "separator" },
      {
        type: "checkbox",
        label: "システム起動時に起動する",
        checked: openAtLogin,
        click: handleToggleOpenAtLogin
      },
      { type: "separator" },
      {
        label: "終了",
        click: (): void => {
          killInputMonitoringProcess()
          global.canQuit = true
          app.quit()
        }
      }
    ] as const satisfies MenuItemConstructorOptions[]

    const contextMenu = Menu.buildFromTemplate([
      ...commonContextMenuFirstHalf,
      ...rankingMenuItems,
      ...commonContextMenuSecondHalf
    ])
    tray?.setContextMenu(contextMenu)
  }

  const generateTop3RankingMenuItems = (ranking: ScoreBoard[]): MenuItemConstructorOptions[] => {
    const rankingItemFormat = "$rank$nickname   ⌨️$keyCount   🖱️$clickCount"

    return ranking.slice(0, 3).map((scoreBoard, idx) => {
      const medal = ["🥇", "🥈", "🥉"][idx] || ""
      return {
        type: "normal",
        label: rankingItemFormat
          .replace("$rank", medal)
          .replace("$nickname", scoreBoard.nickname)
          .replace("$keyCount", scoreBoard.keyCount.toLocaleString())
          .replace("$clickCount", scoreBoard.clickCount.toLocaleString())
      } as const satisfies MenuItemConstructorOptions
    })
  }

  const updateTrayRanking = (
    myKeyCount: number,
    myClickCount: number,
    myUUID: string,
    myNickname: string,
    scoreBoardList: ScoreBoard[]
  ): void => {
    const rankingItemFormat = "$rank$nickname   ⌨️$keyCount   🖱️$clickCount"

    /** 同一ネットワーク内の他のユーザーのスコアを受信していない時の表示 */
    if (scoreBoardList.length === 0) {
      const rankingMenuItems = [
        {
          type: "normal",
          label: rankingItemFormat
            .replace("$rank", "🥇")
            .replace("$nickname", myNickname)
            .replace("$keyCount", myKeyCount.toLocaleString())
            .replace("$clickCount", myClickCount.toLocaleString())
        }
      ] as const satisfies MenuItemConstructorOptions[]

      currentRankingMenuItems = rankingMenuItems
      updateTrayData(rankingMenuItems)
      return
    }

    const ranking = generateRankingData(
      myKeyCount,
      myClickCount,
      myUUID,
      myNickname,
      scoreBoardList
    )

    /** ランキングに表示するトータルのユーザー人数が3人以下であればサブメニューを展開する必要はない */
    if (ranking.length <= 3) {
      const rankingMenuItems = generateTop3RankingMenuItems(ranking)
      currentRankingMenuItems = rankingMenuItems
      updateTrayData(rankingMenuItems)
      return
    }

    /** もし自分を除いて3人のユーザーがスコアボードにいる場合は表示が入り切らなくなるのでサブメニューにランキングを展開する */
    const topRankingMenuItems = generateTop3RankingMenuItems(ranking)
    const moreRankingMenuItems = ranking.slice(3).map((scoreBoard, _) => {
      return {
        type: "normal",
        label: rankingItemFormat
          .replace("$rank", "")
          .replace("$nickname", scoreBoard.nickname)
          .replace("$keyCount", scoreBoard.keyCount.toLocaleString())
          .replace("$clickCount", scoreBoard.clickCount.toLocaleString())
      } as const satisfies MenuItemConstructorOptions
    })

    const rankingMenuItems = [
      ...topRankingMenuItems,
      {
        type: "submenu",
        label: "もっと見る",
        submenu: moreRankingMenuItems
      }
    ] as const satisfies MenuItemConstructorOptions[]

    currentRankingMenuItems = rankingMenuItems
    updateTrayData(rankingMenuItems)
  }

  return {
    initializeTrayUtil,
    updateTrayRanking
  } as const
}
