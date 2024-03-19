import dgram from "dgram"
import { ScoreBoard, StoreManager } from "../store-manager"
import { setupReceiveData } from "./receive-data"
import { startBroadcastInterval } from "./broadcast-data"
import { startSendKeyCountAndClickCountInterval } from "./send-key-count-and-click-count"
import { TrayUtil } from "../tray-util"

export type UdpMessage = {
  identifier: string
} & ScoreBoard

export type UdpCommunicationArgs = Pick<
  StoreManager,
  | "getUUID"
  | "getNickname"
  | "getUdpAddresses"
  | "addUdpAddress"
  | "updateScoreBoardList"
  | "getScoreBoardList"
> & {
  keyCount: number | undefined // global.keyCount
  clickCount: number | undefined // global.clickCount
} & Pick<TrayUtil, "updateTrayRanking">

type UdpCommunication = {
  initializeUdpCommunication: () => void
}

/** UDP通信の管理・実行 */
export const udpCommunication = ({
  getUUID,
  getNickname,
  keyCount,
  clickCount,
  getUdpAddresses,
  addUdpAddress,
  updateScoreBoardList,
  updateTrayRanking,
  getScoreBoardList
}: UdpCommunicationArgs): UdpCommunication => {
  const initializeUdpCommunication = (): void => {
    setupReceiveData({
      addUdpAddress,
      updateScoreBoardList,
      updateTrayRanking,
      getUUID,
      getNickname,
      keyCount,
      clickCount,
      getScoreBoardList
    })

    const client = dgram.createSocket("udp4")
    startBroadcastInterval({ client })
    startSendKeyCountAndClickCountInterval({
      client,
      getUUID,
      getNickname,
      keyCount,
      clickCount,
      getUdpAddresses
    })
  }

  return {
    initializeUdpCommunication
  } as const
}
