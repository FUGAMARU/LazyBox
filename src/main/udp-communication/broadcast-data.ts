import { Socket } from "dgram"
import { UDP_BROADCAST_MESSAGE, UDP_PORT, UDP_BROADCAST_INTERVAL } from "../constants/value"
import { getBroadcastAddresses } from "../utils/getBroadcastAddresses"

type Args = {
  client: Socket
}

/** ブロードキャスト部 */
export const startBroadcastInterval = ({ client }: Args) => {
  client.bind(() => {
    client.setBroadcast(true)

    const broadcastMessage = (): void => {
      const broadcastAddresses = getBroadcastAddresses()
      broadcastAddresses.forEach(address => {
        client.send(UDP_BROADCAST_MESSAGE, UDP_PORT, address)
      })
    }

    // 最初の送信
    broadcastMessage()

    // 一定間隔でブロードキャスト
    setInterval(broadcastMessage, UDP_BROADCAST_INTERVAL * 1000)
  })
}
