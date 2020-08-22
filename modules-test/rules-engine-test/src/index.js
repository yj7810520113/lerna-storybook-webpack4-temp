import Test from './index.vue'

Test.install = function(Vue) {
  Vue.component('Test', Test)
}

export default Test
