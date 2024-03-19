import dgram from "dgram"
import { UDP_BROADCAST_MESSAGE, UDP_IDENTIFIER, UDP_PORT } from "../constants"
import { UdpCommunicationArgs, UdpMessage } from "."
import { getLocalAddresses } from "../utils/getLocalAddresses"

type Args = Pick<UdpCommunicationArgs, "addUdpAddress" | "updateScoreBoardList">

/** データー受信部 */
export const setupReceiveData = ({ addUdpAddress, updateScoreBoardList }: Args) => {
  const server = dgram.createSocket("udp4")

  // 他のクライアントからプライベートIPの通知を受け取った時
  server.on("message", (bufferMessage, remoteInfo) => {
    const message = bufferMessage.toString()
    const localAddresses = getLocalAddresses()

    if (message === UDP_BROADCAST_MESSAGE && !localAddresses.includes(remoteInfo.address)) {
      console.log(`Other Client Found! -> IP: ${remoteInfo.address}`)
      addUdpAddress(remoteInfo.address)
      return
    }

    try {
      const { identifier, ...data } = JSON.parse(message) as UdpMessage

      if (identifier !== undefined && identifier !== UDP_IDENTIFIER) return
      updateScoreBoardList(data)
    } catch (e) {
      // JSON.parseに失敗した時は何もしない
      // UDP_BROADCAST_MESSAGEがデフォルトから書き換えられている場合などはJSON.parseに失敗する
    }
  })

  server.bind(UDP_PORT)

  console.log("UDP Server is running!")
}
