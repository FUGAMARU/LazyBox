import { html, css, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import destyle from "./destyle"

@customElement("card-container")
export class CardContainer extends LitElement {
  @property()
  colorTheme = "green"

  @property()
  title = "キーボード"

  @property()
  score = "123,456"

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

        > .labels {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-top: 4px;
          color: var(--color-text-white);

          > .title {
            font-size: 10px;
            line-height: 14px;
            font-weight: 700;
          }

          > .score {
            font-size: 24px;
            line-height: 32px;
            font-weight: 400;
            font-family: "MyanmarKhyay";
          }
        }
      }
    `
  ]

  render() {
    return html` <div class="card-container -${this.colorTheme}">
      <div class="bar -${this.colorTheme}"></div>
      <div class="labels">
        <p class="title">${this.title}</p>
        <p class="score">${this.score}</p>
      </div>
    </div>`
  }
}
