import dgram from "dgram"
import { UDP_BROADCAST_MESSAGE, UDP_IDENTIFIER, UDP_PORT, UPDATE_RANKING_EVENT } from "../constants"
import { UdpCommunicationArgs, UdpMessage } from "."
import { getLocalAddresses } from "../utils/getLocalAddresses"
import { generateRankingData } from "../utils/generateRankingData"
import { RankCardData } from "../types/RankCardData"

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
  mainWindow
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

      const updatedScoreBoardList = getScoreBoardList()
      const globalKeyCount = getGlobalKeyCount()
      const globalClickCount = getGlobalClickCount()
      const uuid = getUUID()
      const nickname = getNickname()

      updateTrayRanking(globalKeyCount, globalClickCount, uuid, nickname, updatedScoreBoardList)

      /** メインUIの順位表示の更新 */
      if (uuid === undefined || nickname === undefined || updatedScoreBoardList === undefined)
        return

      const rankingData = generateRankingData(
        globalKeyCount,
        globalClickCount,
        uuid,
        nickname,
        updatedScoreBoardList
      )

      const myRanking = rankingData.findIndex(data => data.uuid === uuid) + 1
      const totalRanking = rankingData.length

      mainWindow.webContents.send(UPDATE_RANKING_EVENT, {
        current: myRanking,
        total: totalRanking
      } satisfies RankCardData)
    } catch (e) {
      // JSON.parseに失敗した時は何もしない
      // UDP_BROADCAST_MESSAGEがデフォルトから書き換えられている場合などはJSON.parseに失敗する
    }
  })

  server.bind(UDP_PORT)

  console.log("UDP Server is running!")
}
