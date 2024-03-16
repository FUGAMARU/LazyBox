import { html, css, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import destyle from "../../assets/destyle"

@customElement("count-card")
export class CountCard extends LitElement {
  @property()
  colorTheme: string = "green"

  @property()
  title: string = "Title"

  @property()
  score: string = "0"

  static styles = [
    destyle,
    css`
      .score-label {
        font-size: 24px;
        line-height: 32px;
        font-family: "MyanmarKhyay";
      }
    `
  ]

  render() {
    return html`<card-container colorTheme="${this.colorTheme}" title="${this.title}">
      <div class="score-label">${this.score}</div>
    </card-container>`
  }
}
