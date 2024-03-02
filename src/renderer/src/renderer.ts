const init = (): void => {
  window.addEventListener("DOMContentLoaded", () => {
    doAThing()
  })
}

const doAThing = (): void => {
  replaceText(".uuid-label", window.api.uuid)

  const nicknameInput = document.querySelector(".input-area .nickname") as HTMLInputElement
  const nicknameWarning = document.querySelector(".nickname-warning") as HTMLSpanElement
  const nickname = window.api.nickname
  if (nickname === undefined) {
    nicknameWarning.innerText = "ニックネームが設定されるまで他ユーザーにスコアは共有されません"
    nicknameWarning.style.display = "block"
  } else {
    nicknameInput.value = nickname
  }

  const nicknameSaveButton = document.querySelector(".input-area .button") as HTMLButtonElement
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
}

const replaceText = (selector: string, text: string): void => {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) {
    element.innerText = text
  }
}

init()
