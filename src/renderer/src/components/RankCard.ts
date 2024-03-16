import { html, css, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import destyle from "../../assets/destyle"

@customElement("rank-card")
export class RankCard extends LitElement {
  @property()
  currentRank: string = "0"

  @property()
  totalUserCount: string = "0"

  static styles = [
    destyle,
    css`
      .rank-label {
        font-size: 24px;
        line-height: 32px;
        font-family: "MyanmarKhyay";

        > .current {
          font-size: 24px;
          line-height: 32px;
        }

        > .total {
          font-size: 12px;
          line-height: 16px;
        }
      }
    `
  ]

  render() {
    return html`<card-container colorTheme="yellow" title="順位">
      <div class="rank-label">
        <span class="current">${this.currentRank}</span>
        <span class="total"> / ${this.totalUserCount}</span>
      </div>
    </card-container>`
  }
}
