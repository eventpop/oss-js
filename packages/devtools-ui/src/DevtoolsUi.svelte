<script lang="ts">
  import { onMount } from 'svelte'
  import { scale } from 'svelte/transition'
  let dragging:
    | {
        id: number
        startMouseX: number
        startMouseY: number
        startButtonX: number
        startButtonY: number
      }
    | undefined
  let button: HTMLElement
  let mounted = false
  onMount(() => {
    mounted = true
  })

  const f = (key: string, defaultValue: number) => {
    let v = +(sessionStorage.getItem(key) || undefined)
    if (isNaN(v)) {
      v = defaultValue
    }
    return Math.min(1, Math.max(0, v))
  }
  let x = f('devtools-ui.x', 1)
  let y = f('devtools-ui.y', 0)

  function handlePointerDown(e: PointerEvent) {
    dragging = {
      id: e.pointerId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startButtonX: button.getBoundingClientRect().left,
      startButtonY: button.getBoundingClientRect().top,
    }
  }
  function handlePointerUp(e: PointerEvent) {
    if (!dragging || dragging.id !== e.pointerId) return
    dragging = undefined
    sessionStorage.setItem('devtools-ui.x', x.toString())
    sessionStorage.setItem('devtools-ui.y', y.toString())
    e.preventDefault()
  }
  function handlePointerMove(e: PointerEvent) {
    if (!dragging || dragging.id !== e.pointerId) return
    const targetX = dragging.startButtonX + e.clientX - dragging.startMouseX
    const targetY = dragging.startButtonY + e.clientY - dragging.startMouseY
    x = Math.min(1, Math.max(0, targetX / (window.innerWidth - 64)))
    y = Math.min(1, Math.max(0, targetY / (window.innerHeight - 64)))
    e.preventDefault()
  }
</script>

{#if mounted}
  <button
    transition:scale
    class="button"
    bind:this={button}
    on:pointerdown={handlePointerDown}
    style="left: {(x * 100).toFixed(2)}%; top: {(y * 100).toFixed(
      2,
    )}%; transform: translate({(x * -100).toFixed(2)}%, {(y * -100).toFixed(
      2,
    )}%)">🧑‍💻</button
  >
{/if}

<svelte:window
  on:pointerup={handlePointerUp}
  on:pointermove={handlePointerMove}
/>

<style>
  .button {
    position: fixed;
    top: 0;
    left: 0;
    width: 64px;
    height: 64px;
    border: none;
    background: transparent;
    font-size: 48px;
    padding: 0;
    border-radius: 7px;
    z-index: 9999999;
    cursor: pointer;
    touch-action: none;
    user-select: none;
  }
  .button:hover {
    background: #00000020;
  }
</style>
