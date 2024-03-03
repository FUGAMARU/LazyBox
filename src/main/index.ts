import { app, shell, BrowserWindow } from "electron"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import path from "path"
import icon from "../../resources/icon.png?asset"
import { storeManager } from "./store-manager"
import { inputMonitoringIpc } from "./input-monitoring-ipc"
import { tray } from "./tray"
import { udpCommunication } from "./udp-communication"

export const appRoot = path.resolve(".")

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 450,
    height: 270,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  // HMR for renderer base on electron-vite cli.
  // 開発用にはリモートのURLを、本番用にはローカルのhtmlファイルをロードする。
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"))
  }
}

// このメソッドはElectronの初期化が終了し、ブラウザウィンドウを作成する準備ができたときに呼び出されます。
// 初期化が終了し、ブラウザウィンドウを作成する準備ができたときに呼び出されます。
// いくつかのAPIはこのイベントが発生した後にのみ使用することができます。
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron")

  // 開発環境ではF12でDevToolsを開いたり閉じたりします。
  // 本番では CommandOrControl + R を無視します。
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on("activate", () => {
    // macOSでは、ドックアイコンがクリックされ、他に開いているウィンドウがない場合、アプリでウィンドウを再作成するのが一般的だ。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  main()
})

app.on("window-all-closed", () => {
  // app.quit() バックグラウンド常駐させたいのでウィンドウを全て閉じても終了しない (window-all-closedハンドラーを削除すると終了してしまうようになるので注意)
})

// このファイルには、アプリ固有のメイン・プロセス・コードを含めることができる。
// 別のファイルにして、ここで require することもできます。
const main = (): void => {
  const { hasInitialized } = storeManager()
  const { initializeInputMonitoringIpc, killInputMonitoringProcess } = inputMonitoringIpc()
  const { initializeUdpCommunication } = udpCommunication()
  tray({ createWindow, killInputMonitoringProcess })

  if (!hasInitialized) {
    // 初期設定(UUID自動生成 & ニックネーム手動設定)が完了していない場合は、設定画面を表示する
    createWindow()
  }

  initializeInputMonitoringIpc()
  initializeUdpCommunication()
}
