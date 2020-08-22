import Vue from 'vue'
import Router from 'vue-router'

import Home from '../pages/Home'
// test
const vueJsmTest = () => import('../../modules-test/vue-jsm-test/src')
Vue.use(Router)

const routes = [
  {
    path: '*',
    component: Home
  },
  {
    path: '/examples/map-control',
    component: () => import('../pages/examples/map-control.vue')
  },
  // test用例
  {
    path: '/test/vue-jsm',
    component: vueJsmTest
  },
  {
    path: '/test/rules-engine',
    component: () => import('../../modules-test/rules-engine-test/src')
  }
]

export default new Router({
  routes
})
