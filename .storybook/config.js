import { addParameters,addDecorator,configure } from '@storybook/vue';
import Vue from 'vue';
import mapControl from '../src/pages/examples/map-control.vue'
import { addReadme } from 'storybook-readme/vue';
import { themes, create } from '@storybook/theming';
// import { withNotes } from '@storybook/addon-notes'

function loadStories() {
  /*根据特定的文件名加载stories，在这个例子，用xxx.stories.js命名文件*/
  const req = require.context('../stories', true, /\.stories\.js$/);
  req.keys().forEach(filename => req(filename));
}
const basicTheme = create({
  base: 'light',
  brandTitle: 'README addon',
  brandUrl: 'https://github.com/tuchk4/storybook-readme',
  brandImage: null,
});
addParameters({
  options: {
    showPanel: true,
    panelPosition: 'right',
    showAddonsPanel: true,
    theme: basicTheme,
    theme: themes.dark,
  },
  readme: {
    // You can set the global code theme here.
    codeTheme: 'github',
  },
});
Vue.component('my-button', mapControl);
addDecorator(addReadme);
// addDecorator(withNotes)

configure(loadStories, module);
