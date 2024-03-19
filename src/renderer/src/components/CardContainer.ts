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

        &.-green {
          border-color: #cbff36;
        }

        &.-blue {
          border-color: #24f0fd;
        }

        &.-yellow {
          border-color: #fff506;
        }

        &.-silver {
          border-color: #eaeaea;
        }

        > .bar {
          border-radius: 100px;
          height: 42px;
          width: 4px;

          &.-green {
            background: linear-gradient(180deg, #cbff36 0%, #4ebe26 100%);
          }

          &.-blue {
            background: linear-gradient(180deg, #24f0fd 0%, #2c8afa 100%);
          }

          &.-yellow {
            background: linear-gradient(180deg, #fff506 0%, #fcaa0c 100%);
          }

          &.-silver {
            background: linear-gradient(180deg, #eaeaea 0%, #868686 100%);
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
              background-color: #ff7ef2;
              border-radius: 2px;
              padding: 0px 6px;
            }

            > .success {
              font-size: 8px;
              line-height: 12px;
              background-color: #4fd64f;
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

  render() {
    return html` <div class="card-container -${this.colorTheme}">
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
