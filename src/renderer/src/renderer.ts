const init = (): void => {
  window.addEventListener("DOMContentLoaded", () => {
    doAThing()
  })
}

const doAThing = (): void => {
  replaceText("#uuid", window.api.uuid ?? "UUIDが取得できませんでした")
  replaceAttribute("#key-count", "score", window.api.keyCount?.toLocaleString() ?? "0")
  replaceAttribute("#click-count", "score", window.api.clickCount?.toLocaleString() ?? "0")

  const nickname = window.api.nickname
  if (nickname === undefined) {
    replaceAttribute(
      "#nickname-input",
      "errorText",
      "ニックネームが設定されるまで他ユーザーにスコアは共有されません"
    )
  } else {
    replaceAttribute("#nickname-input", "value", nickname)
  }

  window.electron.ipcRenderer.on("update-key-count", (_, newCount) => {
    replaceAttribute("#key-count", "count", newCount.toLocaleString())
  })

  window.electron.ipcRenderer.on("update-click-count", (_, newCount) => {
    replaceAttribute("#click-count", "count", newCount.toLocaleString())
  })
}

export const handleSaveButtonClick = (): void => {
  const { nicknameInputValue } = window

  if (nicknameInputValue === "") {
    replaceAttribute("#nickname-input", "errorText", "ニックネームを入力してください")
    return
  }

  window.api.setNickname(nicknameInputValue)
  replaceAttribute("#nickname-input", "errorText", "")
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
