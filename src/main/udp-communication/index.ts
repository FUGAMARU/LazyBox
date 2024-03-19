import dgram from "dgram"
import { ScoreBoard, StoreManager } from "../store-manager"
import { setupReceiveData } from "./receive-data"
import { startBroadcastInterval } from "./broadcast-data"
import { startSendKeyCountAndClickCountInterval } from "./send-key-count-and-click-count"

export type UdpMessage = {
  identifier: string
} & ScoreBoard

export type UdpCommunicationArgs = Pick<
  StoreManager,
  "uuid" | "nickname" | "udpAddresses" | "addUdpAddress" | "updateScoreBoardList"
> & {
  keyCount: number | undefined // global.keyCount
  clickCount: number | undefined // global.clickCount
}

type UdpCommunication = {
  initializeUdpCommunication: () => void
}

/** UDP通信の管理・実行 */
export const udpCommunication = ({
  uuid,
  nickname,
  keyCount,
  clickCount,
  udpAddresses,
  addUdpAddress,
  updateScoreBoardList
}: UdpCommunicationArgs): UdpCommunication => {
  const initializeUdpCommunication = (): void => {
    setupReceiveData({ addUdpAddress, updateScoreBoardList })

    const client = dgram.createSocket("udp4")
    startBroadcastInterval({ client })
    startSendKeyCountAndClickCountInterval({
      client,
      uuid,
      nickname,
      keyCount,
      clickCount,
      udpAddresses
    })
  }

  return {
    initializeUdpCommunication
  } as const
}
