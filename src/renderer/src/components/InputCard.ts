import { html, css, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import destyle from "../../assets/destyle"

@customElement("input-card")
export class InputCard extends LitElement {
  @property()
  value?: string | undefined = undefined

  @property()
  errorText?: string | undefined = undefined

  @property()
  successText?: string | undefined = undefined

  static styles = [
    destyle,
    css`
      .input {
        font-size: 12px;
        line-height: 17px;
        border-bottom: solid 0.5px var(--color-text-white);
        outline: none;
        padding-bottom: 4px;

        &::placeholder {
          color: rgba(250, 250, 250, 0.6);
        }
      }
    `
  ]

  render() {
    window.nicknameInputValue = this.value ?? ""

    return html`<card-container
      colorTheme="silver"
      title="あなたのニックネーム"
      errorText=${this.errorText}
      successText=${this.successText}
      buttonText="保存"
      onButtonClick=${() => {
        alert("ボタンがクリックされました")

        const input = this.shadowRoot?.querySelector(".input") as HTMLInputElement
        const value = input.value

        if (value === "") {
          this.errorText = "ニックネームを入力してください"
          return
        }

        this.errorText = undefined
        window.api.setNickname(value)
      }}
    >
      <input
        class="input"
        value=${this.value}
        placeholder="最大15文字でニックネームを入力してください"
        maxlength="15"
        @input=${(e: Event) => {
          this.value = (e.target as HTMLInputElement).value
          window.nicknameInputValue = this.value
        }}
      />
    </card-container>`
  }
}
