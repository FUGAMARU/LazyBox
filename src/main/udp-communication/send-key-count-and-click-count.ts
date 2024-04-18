import { Socket } from "node:dgram"
import { UdpCommunicationArgs, UdpMessage } from "."
import { APP_VERSION, UDP_IDENTIFIER, UDP_PORT, UDP_SEND_COUNT_INTERVAL } from "../constants/value"
import { ensureNickname } from "../utils/ensureNickname"
import { printColoredText } from "../utils/printColoredText"
import { is } from "@electron-toolkit/utils"

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

    /** 送信先が無い場合はデーターを送信する必要がない */
    if (udpAddresses.length === 0) return

    const data = {
      identifier: UDP_IDENTIFIER,
      uuid,
      nickname: ensureNickname(nickname, "otherUser"),
      keyCount: getGlobalKeyCount(),
      clickCount: getGlobalClickCount(),
      appVersion: APP_VERSION,
      knownClients: udpAddresses
    } as const satisfies UdpMessage

    if (is.dev) {
      printColoredText("cyan", "Data to Send!")
      console.log(data)
    }

    const messageString = JSON.stringify(data)

    udpAddresses.forEach(address => {
      client.send(messageString, UDP_PORT, address)
    })
  }

  setInterval(sendKeyClickCount, UDP_SEND_COUNT_INTERVAL * 1000)
}
