import dgram from "dgram"
import { UDP_BROADCAST_MESSAGE, UDP_IDENTIFIER, UDP_PORT } from "../constants"
import { ScoreBoard } from "../store-manager"
import { UdpMessage } from "."

type Args = {
  addUdpAddress: (address: string) => void
  updateScoreBoardList: (scoreBoard: ScoreBoard) => void
  updateLastUpdatedToCurrentTime: (unixTimestamp: number) => void
}

/** データー受信部 */
export const setupReceiveData = ({
  addUdpAddress,
  updateScoreBoardList,
  updateLastUpdatedToCurrentTime
}: Args) => {
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

    if (identifier !== UDP_IDENTIFIER) return
    console.log("Data Received!", data)
    updateScoreBoardList(data)
    updateLastUpdatedToCurrentTime(Math.floor(Date.now() / 1000))
  })

  server.bind(UDP_PORT)
}
