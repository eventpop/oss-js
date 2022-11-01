<script lang="ts">
  import { afterUpdate, onMount } from 'svelte'
  import { scale } from 'svelte/transition'
  import type { Command } from './Command'
  let dragging:
    | {
        id: number
        startMouseX: number
        startMouseY: number
        startButtonX: number
        startButtonY: number
        moved: boolean
      }
    | undefined

  let button: HTMLElement
  let menuElement: HTMLElement
  let mounted = false
  let menu: { position?: { x: number; y: number } } | undefined
  let overlays: { id: number; text: string; x: number; y: number }[] = []
  let nextOverlayId = 1
  export let enabled = false
  export let commands: Command[] = []

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
  let x = f('technologist.x', 1)
  let y = f('technologist.y', 0.5)
  let disableClickBecauseJustMoved = false

  function handlePointerDown(e: PointerEvent) {
    dragging = {
      id: e.pointerId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startButtonX: button.getBoundingClientRect().left,
      startButtonY: button.getBoundingClientRect().top,
      moved: false,
    }
  }
  function handlePointerUp(e: PointerEvent) {
    if (!dragging || dragging.id !== e.pointerId) return
    if (dragging.moved) {
      e.preventDefault()
      disableClickBecauseJustMoved = true
      requestAnimationFrame(() => {
        disableClickBecauseJustMoved = false
      })
    }
    dragging = undefined
    sessionStorage.setItem('devtools-ui.x', x.toString())
    sessionStorage.setItem('devtools-ui.y', y.toString())
  }
  function handlePointerMove(e: PointerEvent) {
    if (!dragging || dragging.id !== e.pointerId) return
    if (dragging.moved) {
      const targetX = dragging.startButtonX + e.clientX - dragging.startMouseX
      const targetY = dragging.startButtonY + e.clientY - dragging.startMouseY
      x = Math.min(1, Math.max(0, targetX / (window.innerWidth - 64)))
      y = Math.min(1, Math.max(0, targetY / (window.innerHeight - 64)))
    } else if (
      Math.hypot(
        e.clientX - dragging.startMouseX,
        e.clientY - dragging.startMouseY,
      ) > 8
    ) {
      dragging.moved = true
      dragging.startMouseX = e.clientX
      dragging.startMouseY = e.clientY
      if (menu) {
        menu = undefined
      }
    }
    e.preventDefault()
  }
  function handleClick() {
    if (disableClickBecauseJustMoved) return
    menu = menu ? undefined : {}
  }
  afterUpdate(() => {
    if (menu && !menu.position && menuElement) {
      const buttonRect = button.getBoundingClientRect()
      const menuRect = menuElement.getBoundingClientRect()

      const x =
        buttonRect.left + menuRect.width > window.innerWidth &&
        buttonRect.left + buttonRect.width - menuRect.width >= 0
          ? buttonRect.left + buttonRect.width - menuRect.width
          : buttonRect.left
      const y =
        buttonRect.top + buttonRect.height + menuRect.height >
          window.innerHeight && buttonRect.top - menuRect.height >= 0
          ? buttonRect.top - menuRect.height
          : buttonRect.top + buttonRect.height
      menu.position = { x, y }
    }
  })
  function runCommand(command: Command, item: HTMLButtonElement) {
    const overlay = {
      text: command.title,
      id: nextOverlayId++,
      x: item.getBoundingClientRect().left,
      y: item.getBoundingClientRect().top,
    }
    menu = undefined
    command.action()
    overlays = [...overlays, overlay]
    setTimeout(() => {
      overlays = overlays.filter((o) => o !== overlay)
    }, 1000)
  }
</script>

{#if mounted && enabled && commands.length > 0}
  <div
    transition:scale
    style="
      position: fixed;
      left: {(x * 100).toFixed(2)}%;
      top: {(y * 100).toFixed(2)}%;
      transform-origin: 0 0;
    "
  >
    <button
      class="button"
      bind:this={button}
      on:pointerdown={handlePointerDown}
      data-testid="Technologist button"
      style="
        transform: translate(
          {(x * -100).toFixed(2)}%,
          {(y * -100).toFixed(2)}%
        );
      "
      on:click={handleClick}
    >
      🧑‍💻
    </button>
  </div>
{/if}

{#if mounted && enabled && commands.length > 0 && !!menu}
  <div
    class="menu"
    bind:this={menuElement}
    data-positioned={menu.position ? 'true' : 'false'}
    style="
      left: {menu.position?.x || 0}px;
      top: {menu.position?.y || 0}px;
    "
    data-testid="Technologist menu"
  >
    {#each commands as command}
      <button
        class="menu-item"
        data-testid="Technologist command: {command.title}"
        on:click={(e) => runCommand(command, e.currentTarget)}
        on:mouseenter={(e) => e.currentTarget.focus()}
      >
        {command.title}
      </button>
    {/each}
  </div>
{/if}

{#each overlays as overlay (overlay.id)}
  <div
    class="overlay-container"
    style="left: {overlay.x}px; top: {overlay.y}px;"
  >
    <button class="menu-item overlay">
      {overlay.text}
    </button>
  </div>
{/each}

<svelte:window
  on:pointerup={handlePointerUp}
  on:pointermove={handlePointerMove}
/>

<style>
  .button {
    display: block;
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
  .menu {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    padding: 2px;
    background: #d3d0c7;
    box-shadow: inset -1px -1px 0 #424142, inset 1px 1px 0 #fff,
      inset -2px -2px 0 #848284, inset 2px 2px 0 #d3d0c7;
  }
  .menu[data-positioned='false'] {
    opacity: 0;
    pointer-events: none;
  }
  .menu-item {
    appearance: none;
    border: none;
    padding: 4px 8px;
    background: transparent;
    color: #000;
    text-align: left;
  }
  .menu-item:focus,
  .overlay {
    background: #07216c;
    color: #fff;
  }

  .overlay-container {
    position: fixed;
    pointer-events: none;
    z-index: 9999999;
  }
  .overlay {
    animation: devtools-ui-menu-fade-out 200ms;
    animation-fill-mode: both;
    display: block;
  }
  @keyframes devtools-ui-menu-fade-out {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    10% {
      opacity: 1;
      transform: scale(0.95);
    }
    20% {
      opacity: 1;
      transform: scale(0.95);
    }
    100% {
      opacity: 0;
      transform: scale(1.1);
    }
  }
</style>
