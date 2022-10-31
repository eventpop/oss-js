import type { Command } from './Command'
import DevtoolsUi from './DevtoolsUi.svelte'

const _DevtoolsUi = DevtoolsUi as any
customElements.define('devtools-ui', _DevtoolsUi)

export interface Disposable {
  dispose(): void
}

export class Devtools {
  private _devtoolsUi?: any
  private _enabled = false
  private _commands: Command[] = []

  constructor() {}

  get enabled() {
    return this._enabled
  }

  set enabled(enabled: boolean) {
    this._enabled = enabled
    this._update()
  }

  _update() {
    if (!this._enabled && !this._devtoolsUi) return
    if (!this._devtoolsUi) {
      this._devtoolsUi = new _DevtoolsUi()
      document.body.appendChild(this._devtoolsUi)
    }
    this._devtoolsUi.$set({
      enabled: this._enabled,
      commands: this._commands,
    })
  }

  registerCommand(title: string, action: () => void): Disposable {
    const command: Command = { title, action }
    this._commands = [...this._commands, command].sort((a, b) =>
      a.title.localeCompare(b.title),
    )
    this._update()
    return {
      dispose: () => {
        this._commands = this._commands.filter((c) => c !== command)
        this._update()
      },
    }
  }
}
