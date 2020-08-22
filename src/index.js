import Vue from 'vue'
import router from './router'
import App from './App'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(Element)

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
