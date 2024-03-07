import dgram from "dgram"
import { ScoreBoard, storeManager } from "../store-manager"
import { setupReceiveData } from "./receive-data"
import { startBroadcastInterval } from "./broadcast-data"
import { startSendKeyCountAndClickCountInterval } from "./send-key-count-and-click-count"

export type UdpMessage = {
  identifier: "LAZY_BOX_SIGNAL"
} & ScoreBoard

type UdpCommunication = {
  initializeUdpCommunication: () => void
}

/** UDP通信の管理・実行 */
export const udpCommunication = (): UdpCommunication => {
  const { uuid, nickname, keyCount, clickCount, udpAddresses, addUdpAddress, setScoreBoard } =
    storeManager()

  const initializeUdpCommunication = (): void => {
    setupReceiveData({ addUdpAddress, setScoreBoard })

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
