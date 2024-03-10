import { Socket } from "dgram"
import { UdpMessage } from "."
import { UDP_IDENTIFIER, UDP_PORT, UDP_SEND_COUNT_INTERVAL } from "../constants"

type Args = {
  client: Socket
  uuid: string | undefined
  nickname: string | undefined
  keyCount: number | undefined
  clickCount: number | undefined
  udpAddresses: string[] | undefined
}

/** 打鍵数・クリック数送信部 */
export const startSendKeyCountAndClickCountInterval = ({
  client,
  uuid,
  nickname,
  keyCount,
  clickCount,
  udpAddresses
}: Args) => {
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
      identifier: UDP_IDENTIFIER,
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

  setInterval(sendKeyClickCount, UDP_SEND_COUNT_INTERVAL * 1000)
}