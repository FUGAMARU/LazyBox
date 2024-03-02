import { app, shell, BrowserWindow, Menu, Tray } from "electron"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import { spawn } from "child_process"
import path from "path"
import icon from "../../resources/icon.png?asset"
import { store } from "./store"

const appRoot = path.resolve(".")
const childProcess = spawn(path.join(appRoot, "resources", "input_monitoring", "windows.exe"), [], {
  shell: true
})

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

  const { hasInitialized } = store()

  if (!hasInitialized) {
    // 初期設定(UUID自動生成 & ニックネーム手動設定)が完了していない場合は、設定画面を表示する
    createWindow()
  }

  app.on("activate", () => {
    // macOSでは、ドックアイコンがクリックされ、他に開いているウィンドウがない場合、アプリでウィンドウを再作成するのが一般的だ。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // C++プロセスからの出力を受け取る
  childProcess.stdout.on("data", data => {
    const message = data.toString().trim()
    message
  })

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
        childProcess.kill()
        console.log("PROCESS KILLED")
        app.quit()
      }
    }
  ])
  tray.setToolTip("LazyBox")
  tray.setContextMenu(contextMenu)
  tray.on("click", () => createWindow())
})

app.on("window-all-closed", () => {
  // app.quit() バックグラウンド常駐させたいのでウィンドウを全て閉じても終了しない (window-all-closedハンドラーを削除すると終了してしまうようになるので注意)
})

// このファイルには、アプリ固有のメイン・プロセス・コードを含めることができる。
// 別のファイルにして、ここで require することもできます。
