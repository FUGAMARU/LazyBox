import { Tray, Menu, app } from "electron"
import path from "path"
import { appRoot } from "."

type Args = {
  createWindow: () => void
  killInputMonitoringProcess: () => void
}

export const tray = ({ createWindow, killInputMonitoringProcess }: Args): void => {
  const tray = new Tray(path.join(appRoot, "resources", "tray_tmp.ico"))
  const contextMenu = Menu.buildFromTemplate([
    { type: "normal", label: "LazyBoxを開く", click: (): void => createWindow() },
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
      label: "終了",
      click: (): void => {
        killInputMonitoringProcess()
        console.log("PROCESS KILLED")
        app.quit()
      }
    }
  ])
  tray.setToolTip("LazyBox")
  tray.setContextMenu(contextMenu)
  tray.on("click", () => createWindow())
}
