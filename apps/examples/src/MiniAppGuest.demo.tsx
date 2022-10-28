import {
  createMiniApp,
  MiniAppLink,
  MiniAppPage,
} from '@eventpop-oss/frame-guest'

const DemoMiniApp = createMiniApp({
  routes: [
    {
      path: '/',
      element: (
        <div style={{ overflow: 'hidden' }}>
          <p>This is the home route</p>
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
  return <MiniAppPage miniApp={DemoMiniApp} />
}

export default MiniAppGuestDemo
