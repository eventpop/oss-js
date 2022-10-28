import DevtoolsUi from './DevtoolsUi.svelte'

const _DevtoolsUi = DevtoolsUi as any
customElements.define('devtools-ui', _DevtoolsUi)

export class Devtools {
  devtoolsUi: any

  constructor() {
    this.devtoolsUi = new _DevtoolsUi()
    document.body.appendChild(this.devtoolsUi)
  }
}
