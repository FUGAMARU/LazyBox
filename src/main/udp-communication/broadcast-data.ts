import os from "os"
import ip from "ip"
import { Socket } from "dgram"
import { UDP_BROADCAST_MESSAGE, UDP_PORT, UDP_BROADCAST_INTERVAL } from "../constants"

// https://qiita.com/niusounds/items/712770e79888f4235637
const getBroadcastAddresses = (): string[] => {
  const networkInterfaces = os.networkInterfaces()
  const results: string[] = []

  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName]?.forEach(networkInterface => {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if ("IPv4" !== networkInterface.family || networkInterface.internal !== false) return

      const broadcastAddress = ip.or(networkInterface.address, ip.not(networkInterface.netmask))
      results.push(broadcastAddress)
    })
  })

  return results
}

type Args = {
  client: Socket
}

/** ブロードキャスト部 */
export const broadcastData = ({ client }: Args) => {
  client.bind(() => {
    const broadcastMessage = (): void => {
      client.setBroadcast(true)

      const broadcastAddresses = getBroadcastAddresses()
      broadcastAddresses.forEach(address => {
        client.send(UDP_BROADCAST_MESSAGE, UDP_PORT, address)
      })

      client.setBroadcast(false)
    }

    // 最初の送信
    broadcastMessage()

    // 一定間隔でブロードキャスト
    setInterval(broadcastMessage, UDP_BROADCAST_INTERVAL * 1000)
  })
}
