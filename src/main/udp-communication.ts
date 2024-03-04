import os from "os"
import ip from "ip"
import dgram from "dgram"
import { UDP_BROADCAST_INTERVAL, UDP_BROADCAST_MESSAGE, UDP_PORT } from "./constants"
import { ScoreBoard, storeManager } from "./store-manager"

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

type UdpMessage = {
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
    /** データー受信部 */
    const server = dgram.createSocket("udp4")

    // 他のクライアントからプライベートIPの通知を受け取った時
    server.on("message", (bufferMessage, remoteInfo) => {
      const message = bufferMessage.toString()

      if (message === UDP_BROADCAST_MESSAGE) {
        console.log(`Other Client Found! -> IP: ${remoteInfo.address}`)
        addUdpAddress(remoteInfo.address)
        return
      }

      const { identifier, ...data } = JSON.parse(message) as UdpMessage

      if (identifier !== "LAZY_BOX_SIGNAL") return
      console.log("Data Received!", data)
      setScoreBoard(data)
    })

    server.bind(UDP_PORT)

    /** ブロードキャスト部 */
    const client = dgram.createSocket("udp4")

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

    /** 打鍵数・クリック数送信部 */
    const sendKeyClickCount = (): void => {
      if (
        uuid === undefined ||
        uuid === "" ||
        nickname === undefined ||
        nickname === "" ||
        udpAddresses === undefined ||
        udpAddresses.length === 0
      )
        return

      const data = {
        identifier: "LAZY_BOX_SIGNAL",
        uuid,
        nickname,
        keyCount: keyCount ?? 0,
        clickCount: clickCount ?? 0
      } as const satisfies UdpMessage

      console.log("Data to Send! ->", data, "to ->", udpAddresses, "at ->", UDP_PORT, "port.")

      const messageString = JSON.stringify(data)

      udpAddresses.forEach(address => {
        client.send(messageString, UDP_PORT, address)
      })
    }

    setInterval(sendKeyClickCount, UDP_BROADCAST_INTERVAL * 1000)
  }

  return {
    initializeUdpCommunication
  } as const
}
