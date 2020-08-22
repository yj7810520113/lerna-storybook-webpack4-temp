// eslint-disable-next-line
import Vue from 'vue'
// import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/vue'
// import { addReadme } from 'storybook-readme'
// props自带控制面板
import { withKnobs } from '@storybook/addon-knobs'

import markdown from './test.md'
storiesOf('ReadMe', module)
  .addDecorator(withKnobs)
  .addParameters({
    readme: {
      content: markdown
      // sidebar: markdown
    }
  })
  .add('readMe', () => `<div></div>`)
  // .addParameters({ notes: markdown })
// .addParameters({
//   readme: {
//     content: markdown,
//     sidebar: markdown
//   }
// })
