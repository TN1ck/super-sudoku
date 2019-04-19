import React from 'react'
import ReactDOM from 'react-dom'

// Your top level component
import Root from './Root'

// Export your top level component as JSX (for static rendering)
export default Root

// Render your Root
if (typeof document !== 'undefined') {
  const target = document.getElementById('root')

  const renderMethod = target.hasChildNodes()
    ? ReactDOM.hydrate
    : ReactDOM.render

  const render = Comp => {
    renderMethod(<Comp />, target)
  }

  // Render!
  render(Root)

  // Hot Module Replacement
  if (module && module.hot) {
    module.hot.accept('./Root', () => {
      render(Root)
    })
  }
}
