import { ScoreBoard } from "../store-manager"

export const generateRankingData = (
  myKeyCount: number,
  myClickCount: number,
  myUUID: string,
  myNickname: string,
  scoreBoardList: ScoreBoard[]
) => {
  return scoreBoardList
    .concat({
      uuid: myUUID,
      nickname: myNickname,
      keyCount: myKeyCount,
      clickCount: myClickCount
    })
    .sort((a, b) => b.keyCount + b.clickCount - (a.keyCount + a.clickCount))
    .filter((scoreBoard, idx, self) => self.findIndex(s => s.uuid === scoreBoard.uuid) === idx) // UUIDの重複排除
}
