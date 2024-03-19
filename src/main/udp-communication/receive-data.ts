import dgram from "dgram"
import { UDP_BROADCAST_MESSAGE, UDP_IDENTIFIER, UDP_PORT } from "../constants"
import { UdpCommunicationArgs, UdpMessage } from "."
import { getLocalAddresses } from "../utils/getLocalAddresses"

type Args = Pick<
  UdpCommunicationArgs,
  | "addUdpAddress"
  | "updateScoreBoardList"
  | "updateTrayRanking"
  | "getUUID"
  | "getNickname"
  | "getGlobalKeyCount"
  | "getGlobalClickCount"
  | "getScoreBoardList"
>

/** データー受信部 */
export const setupReceiveData = ({
  addUdpAddress,
  updateScoreBoardList,
  updateTrayRanking,
  getUUID,
  getNickname,
  getGlobalKeyCount,
  getGlobalClickCount,
  getScoreBoardList
}: Args) => {
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
      const { identifier, ...scoreBoard } = JSON.parse(message) as UdpMessage

      console.log(`
        Received Data! -> ${JSON.stringify(scoreBoard)}
        from -> ${remoteInfo.address}
      `)

      if (identifier !== undefined && identifier !== UDP_IDENTIFIER) return
      updateScoreBoardList(scoreBoard)
      updateTrayRanking(
        getGlobalKeyCount(),
        getGlobalClickCount(),
        getUUID(),
        getNickname(),
        getScoreBoardList()
      )
    } catch (e) {
      // JSON.parseに失敗した時は何もしない
      // UDP_BROADCAST_MESSAGEがデフォルトから書き換えられている場合などはJSON.parseに失敗する
    }
  })

  server.bind(UDP_PORT)

  console.log("UDP Server is running!")
}
