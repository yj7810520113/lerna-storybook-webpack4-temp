// eslint-disable-next-line
import Vue from 'vue'
// import { action } from '@storybook/addon-actions'
import mapControl from '../src/pages/examples/map-control.vue'
import testKnobs from '../src/pages/examples/storybook-knobs.vue'
import { storiesOf } from '@storybook/vue'
// import { addReadme } from 'storybook-readme'
// props自带控制面板
import { withKnobs, text, boolean } from '@storybook/addon-knobs'

import markdown from './test.md'
console.log(mapControl)
storiesOf('GoodsCategory', module)
  .addDecorator(withKnobs)
  .addParameters({
    readme: {
      // content: markdown,
      sidebar: markdown
    }
  })
  .add('default', () => ({
    components: { mapControl },
    template: '<map-control></map-control>'
  }))
  .add('danger', () => ({
    components: { mapControl },
    template: '<map-control></map-control>'
  }))
  .add('with text', () => ({
    components: { testKnobs },
    template: `<test-knobs :isDisabled="isDisabled" :text="text"></test-knobs>`,
    props: {
      isDisabled: {
        default: boolean('isDisabled', false)
      },
      text: {
        default: text('text', 'Hello Storybook', 'GROUP-ID1')
      }
    }
  }))
  // .addParameters({ notes: markdown })
// .addParameters({
//   readme: {
//     content: markdown,
//     sidebar: markdown
//   }
// })
