import { Socket } from "node:dgram"
import { UdpCommunicationArgs, UdpMessage } from "."
import { APP_VERSION, UDP_IDENTIFIER, UDP_PORT, UDP_SEND_COUNT_INTERVAL } from "../constants/value"
import { ensureNickname } from "../utils/ensureNickname"

type Args = {
  client: Socket
} & Pick<
  UdpCommunicationArgs,
  "getUUID" | "getNickname" | "getGlobalKeyCount" | "getGlobalClickCount" | "getUdpAddresses"
>

/** 打鍵数・クリック数送信部 */
export const startSendKeyCountAndClickCountInterval = ({
  client,
  getUUID,
  getNickname,
  getGlobalKeyCount,
  getGlobalClickCount,
  getUdpAddresses
}: Args) => {
  const sendKeyClickCount = (): void => {
    const uuid = getUUID()
    const nickname = getNickname()
    const udpAddresses = getUdpAddresses()

    console.log(`Current Udp Addresses -> ${udpAddresses}`)

    /** 送信先が無い場合はデーターを送信する必要がない */
    if (udpAddresses === undefined || udpAddresses.length === 0) return

    const data = {
      identifier: UDP_IDENTIFIER,
      uuid,
      nickname: ensureNickname(nickname, "otherUser"),
      keyCount: getGlobalKeyCount(),
      clickCount: getGlobalClickCount(),
      appVersion: APP_VERSION,
      totalKnownClients: udpAddresses
    } as const satisfies UdpMessage

    console.log("Data to Send! ->", data, "to ->", udpAddresses, "at ->", UDP_PORT, "port.")

    const messageString = JSON.stringify(data)

    udpAddresses.forEach(address => {
      client.send(messageString, UDP_PORT, address)
    })
  }

  setInterval(sendKeyClickCount, UDP_SEND_COUNT_INTERVAL * 1000)
}
