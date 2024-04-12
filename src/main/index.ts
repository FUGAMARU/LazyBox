import { app, shell, BrowserWindow, nativeTheme, ipcMain } from "electron"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import path from "node:path"
import icon from "../../resources/icons/icon.png?asset"
import { storeManager } from "./store-manager"
import { inputMonitoringIpc } from "./input-monitoring-ipc"
import { trayUtil } from "./tray-util"
import { udpCommunication } from "./udp-communication"
import { scheduler } from "./scheduler"
import { isMatchingOS } from "./utils/isMatchingOS"
import { ensureNickname } from "./utils/ensureNickname"

const createWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 450,
    height: 245,
    show: false,
    autoHideMenuBar: true,
    vibrancy: "popover",
    backgroundMaterial: "acrylic",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  })

  nativeTheme.themeSource = "dark"

  mainWindow.on("close", event => {
    // preventDefaultを呼ぶとapp.quit()できなくなるので、完全終了したい場合はcanQuitを事前にtrueにしておく
    if (global.canQuit) return

    // 1度ウィンドウを閉じた後、タスクトレイから再度表示できるようにするためにhide()しておく
    event.preventDefault()
    mainWindow?.hide()
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

  return mainWindow
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

  // macOSのDockにアイコンを表示しない
  if (isMatchingOS("macos")) app.dock.hide()

  main()
})

app.on("window-all-closed", () => {
  // app.quit() バックグラウンド常駐させたいのでウィンドウを全て閉じても終了しない (window-all-closedハンドラーを削除すると終了してしまうようになるので注意)
})

// このファイルには、アプリ固有のメイン・プロセス・コードを含めることができる。
// 別のファイルにして、ここで require することもできます。
const main = (): void => {
  const {
    hasNickname,
    getUUID,
    getNickname,
    getUdpAddresses,
    addUdpAddress,
    getStoredKeyCount,
    setStoredKeyCount,
    getStoredClickCount,
    setStoredClickCount,
    getGlobalKeyCount,
    getGlobalClickCount,
    getScoreBoardList,
    updateScoreBoardList,
    resetDynamicData,
    getNextResetUnixTimestamp,
    setNextResetUnixTimestamp,
    getRanking
  } = storeManager()

  /* ここに遷移してきた時点で既にUUIDは存在が確定しているので以降のUUID空値チェックなどは不要 */

  /** LazyBoxでは、global.keyCountとglobal.clickCountをリアルタイムな打鍵数・クリック数として扱う
   * そして、最新の打鍵数・クリック数を取得するためにgetGlobalKeyCountとgetGlobalClickCountを使う
   * getStoredKeyCountとgetStoredClickCountは、永続化されたカウントデーターの復元のみに使うので、こことrendererの初期化部分でしか使わない。 */
  global.keyCount = getStoredKeyCount() ?? 0
  global.clickCount = getStoredClickCount() ?? 0

  // 念の為、グローバル変数に初期値をセットしてからcreateWindowしておく
  const mainWindow = createWindow()

  // グローバル変数に初期値をセットしてからinputMonitoringIpc関数を呼び出す必要がある
  const { initializeInputMonitoringIpc, killInputMonitoringProcess } = inputMonitoringIpc({
    mainWindow,
    setStoredKeyCount,
    setStoredClickCount,
    getGlobalKeyCount,
    getGlobalClickCount
  })

  const { initializeTrayUtil, updateTrayRanking } = trayUtil({
    showWindow: () => mainWindow.show(),
    killInputMonitoringProcess
  })

  const { initializeScheduler } = scheduler({
    resetDynamicData,
    getNextResetUnixTimestamp,
    setNextResetUnixTimestamp,
    mainWindow,
    updateTrayRanking,
    getGlobalKeyCount,
    getGlobalClickCount,
    getUUID,
    getNickname,
    getScoreBoardList
  })

  initializeTrayUtil()
  updateTrayRanking(
    getGlobalKeyCount(),
    getGlobalClickCount(),
    getUUID(),
    ensureNickname(getNickname(), "myself"),
    getScoreBoardList()
  ) // ここでupdateTrayRankingを呼ばないと、データーを受信するまでトレイアイコンをクリックしても無反応になる
  // TODO: カッコよくないのでこれ書かなくても良い方法を考える

  const { initializeUdpCommunication } = udpCommunication({
    mainWindow,
    getUUID,
    getNickname,
    getGlobalKeyCount,
    getGlobalClickCount,
    getUdpAddresses,
    addUdpAddress,
    updateScoreBoardList,
    updateTrayRanking,
    getScoreBoardList,
    getRanking
  })

  if (!hasNickname || is.dev) {
    // ニックネーム設定が完了していない場合 or 開発環境の場合は、設定画面を表示する
    mainWindow.show()
  }

  initializeScheduler()
  initializeInputMonitoringIpc()
  initializeUdpCommunication()

  /** レンダラープロセスから最新のカウントを取得するリクエストに反応するためのハンドラー */
  ipcMain.handle("get-key-count", () => {
    return getGlobalKeyCount()
  })

  ipcMain.handle("get-click-count", () => {
    return getGlobalClickCount()
  })
}
