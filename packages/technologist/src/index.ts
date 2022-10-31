import type { Command } from './Command'
import TechnologistUi from './TechnologistUi.svelte'

const _TechnologistUi = TechnologistUi as any
customElements.define('technologist-ui', _TechnologistUi)

export interface Disposable {
  dispose(): void
}

export class Technologist {
  private _ui?: any
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
    if (!this._enabled && !this._ui) return
    if (!this._ui) {
      this._ui = new _TechnologistUi()
      document.body.appendChild(this._ui)
    }
    this._ui.$set({
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
