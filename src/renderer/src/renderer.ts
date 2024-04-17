const init = (): void => {
  window.addEventListener("DOMContentLoaded", () => {
    doAThing()
  })
}

const doAThing = async (): Promise<void> => {
  replaceText("#uuid", window.api.getUUID())
  replaceText("#app-version", window.api.appVersion)

  const keyCount = await window.api.getKeyCount()
  const clickCount = await window.api.getClickCount()
  replaceAttribute("#key-count", "count", keyCount?.toLocaleString())
  replaceAttribute("#click-count", "count", clickCount?.toLocaleString())

  const ranking = await window.api.getRanking()
  replaceAttribute("#ranking", "currentRank", String(ranking.current))
  replaceAttribute("#ranking", "totalUserCount", String(ranking.total))

  const nickname = window.api.getNickname()
  if (nickname !== undefined) {
    replaceAttribute("#nickname-input", "value", nickname)
  }

  window.electron.ipcRenderer.on(window.api.updateKeyCountEventName, (_, newCount) => {
    replaceAttribute("#key-count", "count", newCount.toLocaleString())
  })

  window.electron.ipcRenderer.on(window.api.updateClickCountEventName, (_, newCount) => {
    replaceAttribute("#click-count", "count", newCount.toLocaleString())
  })

  window.electron.ipcRenderer.on(window.api.updateRankingEventName, (_, newRankingData) => {
    const { current, total } = newRankingData
    replaceAttribute("#ranking", "currentRank", current)
    replaceAttribute("#ranking", "totalUserCount", total)
  })
}

export const handleSaveButtonClick = (): void => {
  const { nicknameInputValue } = window

  if (nicknameInputValue === "") {
    replaceAttribute("#nickname-input", "successText", "")
    replaceAttribute("#nickname-input", "errorText", "ニックネームを入力してください")
    return
  }

  window.api.setNickname(nicknameInputValue)
  replaceAttribute("#nickname-input", "errorText", "")
  replaceAttribute("#nickname-input", "successText", "ニックネームを保存しました")

  setTimeout(() => {
    replaceAttribute("#nickname-input", "successText", "")
  }, window.api.nicknameSaveMessageDuration * 1000)
}

const replaceText = (selector: string, text: string): void => {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) {
    element.innerText = text
  }
}

const replaceAttribute = (selector: string, attribute: string, value: string): void => {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) {
    element.setAttribute(attribute, value)
  }
}

init()
