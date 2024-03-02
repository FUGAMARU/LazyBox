class PartsContainer extends HTMLElement {
  label: string

  static get observedAttributes(): string[] {
    return ["label"]
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })

    this.label = ""
  }

  connectedCallback(): void {
    this.render()
  }

  attributeChangedCallback(name: string | number, _: string, newValue: string): void {
    this[name] = newValue
    this.render()
  }

  render(): void {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
      <style>
        .parts-container {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          background-color: white;
          padding: 0.5rem 0.8rem;
          border-radius: 10px;

          > .label {
            color: var(--color-text-gray);
            font-size: 0.7rem;
          }
        }
      </style>

      <div class="parts-container">
        <span class="label">${this.label}</span>
        <slot></slot>
      </div>
    `
    }
  }
}

customElements.define("parts-container", PartsContainer)
