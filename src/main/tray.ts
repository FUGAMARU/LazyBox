import { Tray, Menu, app } from "electron"
import path from "path"
import { appRoot } from "."
import { isMatchingOS } from "./utils/isMatchingOS"
import { TRAY_ICON_MACOS, TRAY_ICON_WINDOWS } from "./constants"

type Args = {
  showWindow: () => void
  killInputMonitoringProcess: () => void
}

export const tray = ({ showWindow, killInputMonitoringProcess }: Args): void => {
  const trayIcon = isMatchingOS("windows") ? TRAY_ICON_WINDOWS : TRAY_ICON_MACOS
  const tray = new Tray(path.join(appRoot, ...trayIcon))
  const contextMenu = Menu.buildFromTemplate([
    { type: "normal", label: "LazyBoxを開く", click: () => showWindow() },
    { type: "separator" },
    { type: "normal", label: "🥇Username1   ⌨️12,345   🖱️5,555" },
    { type: "normal", label: "🥈Username2   ⌨️12,345   🖱️5,555" },
    { type: "normal", label: "🥉Username3   ⌨️12,345   🖱️5,555" },
    {
      type: "submenu",
      label: "もっと見る",
      submenu: [
        { label: "Username4   ⌨️12,345   🖱️5,555" },
        { label: "Username5   ⌨️12,345   🖱️5,555" },
        { label: "Username6   ⌨️12,345   🖱️5,555" }
      ]
    },
    { type: "separator" },
    {
      type: "submenu",
      label: "アイコンカラーを変更",
      submenu: [{ label: "カラー" }, { label: "ライト" }, { label: "ダーク" }]
    },
    {
      label: "終了",
      click: (): void => {
        killInputMonitoringProcess()
        console.log("PROCESS KILLED")
        global.canQuit = true
        app.quit()
      }
    }
  ])
  tray.setToolTip("LazyBox")
  tray.setContextMenu(contextMenu)
  tray.on("click", () => {
    if (isMatchingOS("windows")) showWindow()
  })
}
