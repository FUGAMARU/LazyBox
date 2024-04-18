import dgram from "node:dgram"
import {
  UDP_BROADCAST_MESSAGE,
  UDP_IDENTIFIER,
  UDP_PORT,
  UPDATE_RANKING_EVENT
} from "../constants/value"
import { UdpCommunicationArgs, UdpMessage } from "."
import { getLocalAddresses } from "../utils/getLocalAddresses"
import { ensureNickname } from "../utils/ensureNickname"
import { printColoredText } from "../utils/printColoredText"
import { is } from "@electron-toolkit/utils"

type Args = Pick<
  UdpCommunicationArgs,
  | "mainWindow"
  | "addUdpAddress"
  | "updateScoreBoardList"
  | "updateTrayRanking"
  | "getUUID"
  | "getNickname"
  | "getGlobalKeyCount"
  | "getGlobalClickCount"
  | "getScoreBoardList"
  | "getRanking"
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
  getScoreBoardList,
  mainWindow,
  getRanking
}: Args) => {
  const server = dgram.createSocket("udp4")

  // 他のクライアントからプライベートIPの通知を受け取った時
  server.on("message", (bufferMessage, remoteInfo) => {
    const message = bufferMessage.toString()
    const localAddresses = getLocalAddresses()

    if (message === UDP_BROADCAST_MESSAGE && !localAddresses.includes(remoteInfo.address)) {
      if (is.dev) {
        printColoredText("magenta", "Other Client Found!")
        console.log(remoteInfo.address)
      }
      addUdpAddress(remoteInfo.address)
      return
    }

    try {
      const { identifier, ...scoreBoard } = JSON.parse(message) as UdpMessage

      if (is.dev) {
        printColoredText("green", "Received Data!")
        console.log(scoreBoard)
      }

      if (identifier !== undefined && identifier !== UDP_IDENTIFIER) return

      updateScoreBoardList(scoreBoard)

      updateTrayRanking(
        getGlobalKeyCount(),
        getGlobalClickCount(),
        getUUID(),
        ensureNickname(getNickname(), "myself"),
        getScoreBoardList()
      )

      /** メインUIの順位表示の更新 */
      const rankingData = getRanking()
      mainWindow.webContents.send(UPDATE_RANKING_EVENT, rankingData)
    } catch (e) {
      // JSON.parseに失敗した時は何もしない
      // UDP_BROADCAST_MESSAGEがデフォルトから書き換えられている場合などはJSON.parseに失敗する
    }
  })

  server.bind(UDP_PORT)
}
