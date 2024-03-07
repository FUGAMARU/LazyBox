import dgram from "dgram"
import { UDP_BROADCAST_MESSAGE, UDP_PORT } from "../constants"
import { ScoreBoard } from "../store-manager"
import { UdpMessage } from "."

type Args = {
  addUdpAddress: (address: string) => void
  updateScoreBoardList: (scoreBoard: ScoreBoard) => void
}

/** データー受信部 */
export const setupReceiveData = ({ addUdpAddress, updateScoreBoardList }: Args) => {
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
    updateScoreBoardList(data)
  })

  server.bind(UDP_PORT)
}
