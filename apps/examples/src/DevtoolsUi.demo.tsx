import { Devtools } from '@eventpop-oss/devtools-ui'
import { useEffect, useState } from 'react'

const d = new Devtools()
let nextId = 1
d.registerCommand('Add a command', () => {
  const command = d.registerCommand(`Dynamic command #${nextId++}`, () => {
    command.dispose()
  })
})

export const DevtoolsUiDemo = () => {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    d.enabled = enabled
  }, [enabled])
  useEffect(() => {
    // Press "t" to toggle devtools
    const listener = (e: KeyboardEvent) => {
      if (e.key === 't') {
        setEnabled((enabled) => !enabled)
      }
    }
    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [])
  useEffect(() => {
    const { dispose } = d.registerCommand('Turn off devtools', () => {
      setEnabled(false)
    })
    return dispose
  }, [])
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked)
          }}
        />{' '}
        Enable devtools (press <kbd>t</kbd>)
      </label>
    </>
  )
}

export default DevtoolsUiDemo
