import { html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import destyle from "../../../assets/destyle"

@customElement("icon-mouse")
export class IconMouse extends LitElement {
  @property()
  width: number = 0

  @property()
  height: number = 0

  static styles = destyle

  render() {
    return html`<svg
      width=${this.width}
      height=${this.height}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75 0.75H5.25C4.45462 0.750869 3.69206 1.06722 3.12964 1.62964C2.56722 2.19206 2.25087 2.95462 2.25 3.75V8.25C2.25087 9.04538 2.56722 9.80794 3.12964 10.3704C3.69206 10.9328 4.45462 11.2491 5.25 11.25H6.75C7.54538 11.2491 8.30794 10.9328 8.87036 10.3704C9.43278 9.80794 9.74913 9.04538 9.75 8.25V3.75C9.74913 2.95462 9.43278 2.19206 8.87036 1.62964C8.30794 1.06722 7.54538 0.750869 6.75 0.75ZM9 3.75V4.875H6.375V1.5H6.75C7.34655 1.50062 7.91848 1.73787 8.34031 2.1597C8.76213 2.58152 8.99938 3.15345 9 3.75ZM5.25 1.5H5.625V4.875H3V3.75C3.00062 3.15345 3.23787 2.58152 3.6597 2.1597C4.08152 1.73787 4.65345 1.50062 5.25 1.5ZM6.75 10.5H5.25C4.65345 10.4994 4.08152 10.2621 3.6597 9.84031C3.23787 9.41848 3.00062 8.84655 3 8.25V5.625H9V8.25C8.99938 8.84655 8.76213 9.41848 8.34031 9.84031C7.91848 10.2621 7.34655 10.4994 6.75 10.5Z"
        fill="#24F0FD"
        fill-opacity="0.8"
      />
    </svg> `
  }
}
