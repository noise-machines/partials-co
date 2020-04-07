import { h } from 'preact' /** @jsx h */
import Raven from 'raven-js'
import App from './components/App'
import render from './render'
import awaitServiceWorkerRegistration from './awaitServiceWorkerRegistration'

if (process.env.NODE_ENV === 'production') {
  Raven.config(
    'https://31fc87aa5aaf4cd5ba5ff310b708364e@sentry.io/276362',
    {}
  ).install()
}

const init = () => {
  awaitServiceWorkerRegistration()
  const root = document.getElementById('root')
  // Clear out any pre-rendered content in root.
  root.innerHTML = ''
  render(<App />, root)
}

if (process.env.NODE_ENV === 'production') {
  Raven.context(function () {
    init()
  })
} else {
  init()
}
