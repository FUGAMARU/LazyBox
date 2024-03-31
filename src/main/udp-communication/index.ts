import dgram from "dgram"
import { ScoreBoard, StoreManager } from "../store-manager"
import { setupReceiveData } from "./receive-data"
import { startBroadcastInterval } from "./broadcast-data"
import { startSendKeyCountAndClickCountInterval } from "./send-key-count-and-click-count"
import { TrayUtil } from "../tray-util"
import { BrowserWindow } from "electron"

export type UdpMessage = {
  identifier: string
} & ScoreBoard

export type UdpCommunicationArgs = { mainWindow: BrowserWindow } & Pick<
  StoreManager,
  | "getUUID"
  | "getNickname"
  | "getUdpAddresses"
  | "addUdpAddress"
  | "updateScoreBoardList"
  | "getScoreBoardList"
  | "getGlobalKeyCount"
  | "getGlobalClickCount"
  | "getRanking"
> &
  Pick<TrayUtil, "updateTrayRanking">

type UdpCommunication = {
  initializeUdpCommunication: () => void
}

/** UDP通信の管理・実行 */
export const udpCommunication = ({
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
}: UdpCommunicationArgs): UdpCommunication => {
  const initializeUdpCommunication = (): void => {
    setupReceiveData({
      mainWindow,
      addUdpAddress,
      updateScoreBoardList,
      updateTrayRanking,
      getUUID,
      getNickname,
      getGlobalKeyCount,
      getGlobalClickCount,
      getScoreBoardList,
      getRanking
    })

    const client = dgram.createSocket("udp4")
    startBroadcastInterval({ client })
    startSendKeyCountAndClickCountInterval({
      client,
      getUUID,
      getNickname,
      getGlobalKeyCount,
      getGlobalClickCount,
      getUdpAddresses
    })
  }

  return {
    initializeUdpCommunication
  } as const
}
