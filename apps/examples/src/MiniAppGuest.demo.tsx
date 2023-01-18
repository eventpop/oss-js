import {
  createMiniApp,
  MiniAppLink,
  MiniAppPage,
  getMiniAppGuest,
} from '@eventpop-oss/frame-guest'

function LocaleInspector() {
  return <p>locale is {getMiniAppGuest().locale}</p>
}
const DemoMiniApp = createMiniApp({
  routes: [
    {
      path: '/',
      element: (
        <div style={{ overflow: 'hidden' }}>
          <p>This is the home route</p>
          <LocaleInspector />
          <MiniAppLink to="/foo">Go to Foo</MiniAppLink>
        </div>
      ),
    },
    {
      path: '/foo',
      element: (
        <div style={{ overflow: 'hidden' }}>
          <p>This is the foo route</p>
          <MiniAppLink to="/">Back to home</MiniAppLink>
        </div>
      ),
    },
  ],
})

export const MiniAppGuestDemo = () => {
  if (window.top === window) {
    return (
      <>
        This page is a mini-app, so it cannot run on its own. You are probably
        looking for the <a href="/?demo=MiniAppHost">MiniAppHost demo</a>.
      </>
    )
  }
  return <MiniAppPage miniApp={DemoMiniApp} />
}

export default MiniAppGuestDemo
