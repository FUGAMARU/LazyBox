const init = (): void => {
  window.addEventListener("DOMContentLoaded", () => {
    doAThing()
  })
}

const doAThing = (): void => {
  replaceText("#uuid", window.api.uuid ?? "UUIDが取得できませんでした")
  replaceAttribute("#key-count", "score", window.api.keyCount?.toLocaleString() ?? "0")
  replaceAttribute("#click-count", "score", window.api.clickCount?.toLocaleString() ?? "0")

  const nicknameInput = document.querySelector("#nickname-input") as HTMLInputElement
  const nicknameWarning = document.querySelector("#nickname-input-warning") as HTMLSpanElement
  const nickname = window.api.nickname
  if (nickname === undefined) {
    nicknameWarning.innerText = "ニックネームが設定されるまで他ユーザーにスコアは共有されません"
    nicknameWarning.style.display = "block"
  } else {
    nicknameInput.value = nickname
  }

  const nicknameSaveButton = document.querySelector("#nickname-save-button") as HTMLButtonElement
  nicknameSaveButton?.addEventListener("click", () => {
    const value = nicknameInput.value

    if (value === "") {
      nicknameWarning.innerText = "ニックネームを入力してください"
      nicknameWarning.style.display = "block"
      return
    }

    nicknameWarning.style.display = "none"
    window.api.setNickname(value)
  })

  window.electron.ipcRenderer.on("update-key-count", (_, newCount) => {
    replaceAttribute("#key-count", "count", newCount.toLocaleString())
  })

  window.electron.ipcRenderer.on("update-click-count", (_, newCount) => {
    replaceAttribute("#click-count", "count", newCount.toLocaleString())
  })
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
