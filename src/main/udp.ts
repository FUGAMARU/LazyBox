import os from "os"
import ip from "ip"
import dgram from "dgram"
import { UDP_BROADCAST_INTERVAL, UDP_BROADCAST_MESSAGE, UDP_PORT } from "./constants"
import { store } from "./store"

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

type UDPType = {
  initializeUdp: () => void
}

/** UDP通信の管理・実行 */
export const udp = (): UDPType => {
  const { addUdpAddress } = store()

  const initializeUdp = (): void => {
    /** データー受信部 */
    const server = dgram.createSocket("udp4")

    // 他のクライアントからプライベートIPの通知を受け取った時
    server.on("message", (message, remoteInfo) => {
      if (message.toString() !== UDP_BROADCAST_MESSAGE) return
      console.log(`Other Client Found! -> IP: ${remoteInfo.address}`)
      addUdpAddress(remoteInfo.address)
    })

    server.bind(UDP_PORT)

    /** ブロードキャスト部 */
    const client = dgram.createSocket("udp4")

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

  return {
    initializeUdp
  } as const
}
