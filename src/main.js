// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import UploadButton from 'vuetify-upload-button'
// import Raven from 'raven-js'
// import RavenVue from 'raven-js/plugins/vue'

window.blockstack = require('blockstack')
window.axios = require('axios')

/* todo add raven configurations
Raven
  .config('https://@sentry.io/1279197')
  .addPlugin(RavenVue, Vue)
  .install()
  */

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(UploadButton)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
