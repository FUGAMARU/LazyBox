import { Tray, Menu, app, MenuItemConstructorOptions, nativeTheme } from "electron"
import { isMatchingOS } from "./utils/isMatchingOS"
import { ScoreBoard } from "./store-manager"
import { generateRankingData } from "./utils/generateRankingData"
import { TRAY_ICON_WINDOWS, TRAY_ICON_MACOS_DARK, TRAY_ICON_MACOS_LIGHT } from "./constants/path"

type Args = {
  showWindow: () => void
  killInputMonitoringProcess: () => void
}

export type TrayUtil = {
  initializeTrayUtil: () => void
  updateTrayRanking: (
    myKeyCount: number | undefined,
    myClickCount: number | undefined,
    myUUID: string | undefined,
    myNickname: string | undefined,
    scoreBoardList: ScoreBoard[] | undefined
  ) => void
}

export const trayUtil = ({ showWindow, killInputMonitoringProcess }: Args): TrayUtil => {
  let tray: Tray | undefined = undefined

  const commonContextMenuFirstHalf = [
    { type: "normal", label: "LazyBoxを開く", click: () => showWindow() },
    { type: "separator" }
  ] as const satisfies MenuItemConstructorOptions[]
  const commonContextMenuSecondHalf = [
    { type: "separator" },
    {
      label: "終了",
      click: (): void => {
        killInputMonitoringProcess()
        console.log("PROCESS KILLED")
        global.canQuit = true
        app.quit()
      }
    }
  ] as const satisfies MenuItemConstructorOptions[]

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

  const updateTrayRanking = (
    myKeyCount: number | undefined,
    myClickCount: number | undefined,
    myUUID: string | undefined,
    myNickname: string | undefined,
    scoreBoardList: ScoreBoard[] | undefined
  ): void => {
    const rankingItemFormat = "$rank$nickname   ⌨️$keyCount   🖱️$clickCount"

    if (
      myKeyCount === undefined ||
      myClickCount === undefined ||
      myUUID === undefined ||
      myUUID === "" ||
      myNickname === undefined ||
      myNickname === ""
    ) {
      const contextMenu = Menu.buildFromTemplate([
        ...commonContextMenuFirstHalf,
        { type: "normal", label: "未設定のデーターがあるため他ユーザーとスコアを共有していません" },
        ...commonContextMenuSecondHalf
      ])
      tray?.setContextMenu(contextMenu)
      return
    }

    if (scoreBoardList === undefined || scoreBoardList.length === 0) {
      const contextMenu = Menu.buildFromTemplate([
        ...commonContextMenuFirstHalf,
        {
          type: "normal",
          label: rankingItemFormat
            .replace("$rank", "🥇")
            .replace("$nickname", myNickname)
            .replace("$keyCount", myKeyCount.toLocaleString())
            .replace("$clickCount", myClickCount.toLocaleString())
        },
        ...commonContextMenuSecondHalf
      ])
      tray?.setContextMenu(contextMenu)
      return
    }

    const ranking = generateRankingData(
      myKeyCount,
      myClickCount,
      myUUID,
      myNickname,
      scoreBoardList
    )

    console.log("RANKING")
    console.log(ranking)

    const topRankingMenuItems = ranking.slice(0, 3).map((scoreBoard, idx) => {
      const medal = ["🥇", "🥈", "🥉"][idx] || ""
      return {
        type: "normal",
        label: rankingItemFormat
          .replace("$rank", medal)
          .replace("$nickname", scoreBoard.nickname)
          .replace("$keyCount", scoreBoard.keyCount.toLocaleString())
          .replace("$clickCount", scoreBoard.clickCount.toLocaleString())
      }
    })

    const moreRankingMenuItems = ranking.slice(3).map((scoreBoard, _) => {
      return {
        type: "normal",
        label: rankingItemFormat
          .replace("$rank", "")
          .replace("$nickname", scoreBoard.nickname)
          .replace("$keyCount", scoreBoard.keyCount.toLocaleString())
          .replace("$clickCount", scoreBoard.clickCount.toLocaleString())
      }
    })

    const rankingMenuItems = [
      ...topRankingMenuItems,
      {
        type: "submenu",
        label: "もっと見る",
        submenu: moreRankingMenuItems
      }
    ] as MenuItemConstructorOptions[]

    const contextMenu = Menu.buildFromTemplate([
      ...commonContextMenuFirstHalf,
      ...rankingMenuItems,
      ...commonContextMenuSecondHalf
    ])
    tray?.setContextMenu(contextMenu)
  }

  return {
    initializeTrayUtil,
    updateTrayRanking
  } as const
}
