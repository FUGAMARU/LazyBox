import { Tray, Menu, app, MenuItemConstructorOptions } from "electron"
import path from "path"
import { appRoot } from "."
import { isMatchingOS } from "./utils/isMatchingOS"
import { TRAY_ICON_MACOS, TRAY_ICON_WINDOWS } from "./constants"
import { ScoreBoard } from "./store-manager"

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
    const trayIcon = isMatchingOS("windows") ? TRAY_ICON_WINDOWS : TRAY_ICON_MACOS
    tray = new Tray(path.join(appRoot, ...trayIcon))
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
    if (
      myKeyCount === undefined ||
      myClickCount === undefined ||
      scoreBoardList === undefined ||
      scoreBoardList.length === 0 ||
      myUUID === undefined ||
      myUUID === "" ||
      myNickname === undefined ||
      myNickname === ""
    ) {
      const contextMenu = Menu.buildFromTemplate([
        ...commonContextMenuFirstHalf,
        { type: "normal", label: "他ユーザーのスコアデーターを受信していません" },
        ...commonContextMenuSecondHalf
      ])
      tray?.setContextMenu(contextMenu)
      return
    }

    // ScoreBoardListの各アイテムのkeyCountとclickCountを合計し、降順に並べ替える。また、自分のスコアもランキングに含める
    const ranking = scoreBoardList
      .concat({
        uuid: myUUID,
        nickname: myNickname,
        keyCount: myKeyCount,
        clickCount: myClickCount
      })
      .sort((a, b) => b.keyCount + b.clickCount - (a.keyCount + a.clickCount))

    console.log("RANKING")
    console.log(ranking)

    const rankingMenuItems = ranking.map((scoreBoard, index) => {
      const medal = ["🥇", "🥈", "🥉"][index] || ""
      return {
        type: "normal",
        label: `${medal}${scoreBoard.nickname}   ⌨️${scoreBoard.keyCount}   🖱️${scoreBoard.clickCount}`
      }
    }) as MenuItemConstructorOptions[]

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
