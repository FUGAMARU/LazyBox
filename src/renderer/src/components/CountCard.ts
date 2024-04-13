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
  count: string = "0"

  @property()
  icon: "keyboard" | "mouse" | undefined = undefined

  static styles = [
    destyle,
    css`
      .count-label {
        font-size: 24px;
        line-height: 32px;
        font-family: "MyanmarKhyay";
      }
    `
  ]

  render() {
    return html`<card-container
      colorTheme="${this.colorTheme}"
      title="${this.title}"
      icon="${this.icon}"
    >
      <div class="count-label">${this.count}</div>
    </card-container>`
  }
}
