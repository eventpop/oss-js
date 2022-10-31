import { Technologist } from 'technologist'
import { useEffect, useState } from 'react'

const d = new Technologist()
let nextId = 1
d.registerCommand('Add a command', () => {
  const command = d.registerCommand(`Dynamic command #${nextId++}`, () => {
    command.dispose()
  })
})

export const TechnologistDemo = () => {
  const [enabled, setEnabled] = useState(true)
  useEffect(() => {
    d.enabled = enabled
  }, [enabled])
  useEffect(() => {
    const { dispose } = d.registerCommand('Turn off technologist', () => {
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
        Enable technologist (press <kbd>t</kbd>)
      </label>
    </>
  )
}

export default TechnologistDemo
