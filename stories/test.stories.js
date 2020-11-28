// eslint-disable-next-line
import Vue from 'vue'
// import { action } from '@storybook/addon-actions'
import vueExample from '../examples/pages/index.vue'
import { storiesOf } from '@storybook/vue'
// import { addReadme } from 'storybook-readme'
// props自带控制面板
import { withKnobs } from '@storybook/addon-knobs'
import markdown from './test.md'
storiesOf('Story', module)
  .addDecorator(withKnobs)
  .addParameters({
    readme: {
      // content: markdown,
      sidebar: markdown
    }
  })
  .add('default', () => ({
    components: { vueExample },
    template: '<vue-example></vue-example>'
  }))
