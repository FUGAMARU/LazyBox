import { html, css, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import destyle from "../../assets/destyle"
import { handleSaveButtonClick } from "../renderer"

@customElement("card-container")
export class CardContainer extends LitElement {
  @property()
  colorTheme: string = "green"

  @property()
  title: string = "Title"

  @property()
  icon?: "trophy" | "keyboard" | "mouse" | undefined = undefined

  /** InputCard用ここから */
  @property()
  errorText?: string | undefined = undefined

  @property()
  successText?: string | undefined = undefined

  @property()
  buttonText?: string | undefined = undefined

  @property({ attribute: false })
  onButtonClick?: () => void | undefined = undefined
  /** InputCard用ここまで */

  static styles = [
    destyle,
    css`
      .card-container {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(188, 188, 188, 0.25) 100%
        );
        border: 0.5px solid;
        border-radius: 10px;
        position: relative;

        &.-green {
          border-color: var(--color-border-green);
        }

        &.-blue {
          border-color: var(--color-border-blue);
        }

        &.-yellow {
          border-color: var(--color-border-yellow);
        }

        &.-silver {
          border-color: var(--color-border-silver);
        }

        > .icon {
          position: absolute;
          top: 5px;
          right: 10px;
          line-height: 1;
        }

        > .bar {
          border-radius: 100px;
          height: 42px;
          width: 4px;

          &.-green {
            background: var(--color-gradient-green);
          }

          &.-blue {
            background: var(--color-gradient-blue);
          }

          &.-yellow {
            background: var(--color-gradient-yellow);
          }

          &.-silver {
            background: var(--color-gradient-silver);
          }
        }

        > .contents {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-top: 4px;

          > .upper {
            display: flex;
            align-items: center;
            gap: 8px;

            > .title {
              font-size: 10px;
              line-height: 14px;
              font-weight: 700;
            }

            > .error {
              font-size: 8px;
              line-height: 12px;
              background-color: var(--color-error);
              border-radius: 2px;
              padding: 0px 6px;
            }

            > .success {
              font-size: 8px;
              line-height: 12px;
              background-color: var(--color-success);
              border-radius: 2px;
              padding: 0px 6px;
            }
          }
        }

        .button {
          font-size: 12px;
          line-height: 17px;
          font-weight: bold;
          flex-shrink: 0;
          padding: 4px 12px;
          border-radius: 5px;
          transition: background-color 0.2s ease-in-out;
          outline: none;

          &:hover {
            background-color: rgba(250, 250, 250, 0.2);
          }
        }
      }
    `
  ]

  private iconHTML = {
    trophy: html`<icon-trophy width="12" height="13"></icon-trophy>`,
    keyboard: html`<icon-keyboard width="16" height="16"></icon-keyboard>`,
    mouse: html`<icon-mouse width="12" height="12"></icon-mouse>`
  }

  render() {
    return html` <div class="card-container -${this.colorTheme}">
      ${this.icon ? html`<div class="icon">${this.iconHTML[this.icon]}</div>` : ""}
      <div class="bar -${this.colorTheme}"></div>
      <div class="contents">
        <div class="upper">
          <span class="title">${this.title}</span>
          ${this.errorText
            ? html`<span class="error" id="error-text">${this.errorText}</span>`
            : ""}
          ${this.successText
            ? html`<span class="success" id="success-text">${this.successText}</span>`
            : ""}
        </div>
        <slot></slot>
      </div>
      ${this.buttonText
        ? html`<button class="button" @click=${handleSaveButtonClick}>${this.buttonText}</button>`
        : ""}
    </div>`
  }
}
