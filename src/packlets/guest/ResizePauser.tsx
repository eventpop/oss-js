const activePausers = new Set<ResizePauser>()
const activeActions = new Set<ResizeAction>()

/**
 * A resize pauser prevents the Mini App guest from notifying the host about
 * height changes while paused.
 */
export class ResizePauser {
  pause() {
    activePausers.add(this)
  }
  unpause() {
    activePausers.delete(this)
    if (activePausers.size === 0) {
      activeActions.forEach((action) => action.check())
    }
  }
}

/**
 * An action to update height.
 */
export class ResizeAction {
  private _pending?: () => void

  /**
   * If no ResizePauser is active, `f()` is called immediately.
   * Otherwise, wait until all ResizePausers are unpaused and then
   * call the latest `f()`.
   */
  run(f: () => void) {
    if (activePausers.size === 0) {
      f()
    } else {
      this._pending = f
      activeActions.add(this)
    }
  }

  check() {
    if (activePausers.size === 0) {
      if (this._pending) {
        this._pending()
        this._pending = undefined
      }
      activeActions.delete(this)
    }
  }

  dispose() {
    activeActions.delete(this)
  }
}
