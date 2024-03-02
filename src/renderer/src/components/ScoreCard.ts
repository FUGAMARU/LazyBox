class ScoreCard extends HTMLElement {
  label: string
  score: string
  unit: string

  static get observedAttributes(): string[] {
    return ["label", "score", "unit"]
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })

    this.label = ""
    this.score = ""
    this.unit = ""
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
          .score-card {
            color: var(--color-text-black);

            > .score {
              font-size: 1.5rem;
            }

            > .unit {
              font-size: 0.8rem;
            }
          }
        </style>

        <parts-container label=${this.label}>
          <div class="score-card">
            <span class="score">${this.score}</span><span class="unit"> ${this.unit}</span>
          </div>
        </parts-container>
      `
    }
  }
}

customElements.define("score-card", ScoreCard)
