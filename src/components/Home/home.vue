<template>
  <div>
    <h3>Hello {{ name }} from my Vue.js page。（Webpack4，lerna，jest）</h3>
    <Test />
  </div>
</template>

<script>
import { add } from '../../../modules/js-template/src/index'
import Test from '../../../modules/vue-template/src/index'
// let Test = Vue.extend(require('../../../modules/vue-test/dist'))
// Vue.component('test', require('../../../modules/vue-test/dist').default)
export default {
  components: {
    Test
  },
  props: {
    name: {
      type: String,
      required: true
    }
  },
  created() {
    // console.log(add)
    console.log(add(1, 2))
  }
}
</script>
