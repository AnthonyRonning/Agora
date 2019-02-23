<template>
  <statichtmlpage></statichtmlpage>

</template>

<script>
  import Vue from 'vue'

/*  Vue.component('statichtmlpage', function (resolve, reject) {
    Vue.http.get('helloworld.html', function (data, status, request) {
      var parser = new DOMParser()
      var doc = parser.parseFromString(data, 'text/html')
      resolve({
        template: doc
      })
    })
}) */

  Vue.component('statichtmlpage', function (resolve, reject) {
    window.axios.get('03_webapp.html')
      .then(function (response) {
        // logger.info('got html data', {data: response.data})
        // var parser = new DOMParser()
        // var doc = parser.parseFromString(response.data, 'text/html')
        logger.info('setting html')
        resolve({
          template: response.data
        })

        Vue.loadScript('assets/js/vendor/jquery-2.2.4.min.js')
        Vue.loadScript('assets/js/vendor/jquery.waypoints.js')
        Vue.loadScript('assets/js/menu.js')
        Vue.loadScript('assets/js/mobile-menu.js')
        Vue.loadScript('assets/js/vendor/jquery-ui.min.js')
        Vue.loadScript('assets/js/pricing.js')
        Vue.loadScript('assets/js/vendor/slick.min.js')
        Vue.loadScript('assets/js/vendor/dragscrollable.min.js')
        Vue.loadScript('assets/js/vendor/device.js')
        Vue.loadScript('assets/js/carousel.js')
        Vue.loadScript('assets/js/style-switcher.js')
      })
  })
  const logger = require('heroku-logger')

export default {
    name: 'landing2',
    data () {
      return {
        blockstack: window.blockstack,
        respondedTest: ''
      }
    },
    methods: {
      getHtml () {
        logger.info('about to get html')
        Vue.http.get('helloworld.html', function (data, status, request) {
          logger.info('got html data', {data: data})
          var parser = new DOMParser()
          var doc = parser.parseFromString(data, 'text/html')
          logger.info('setting text', {html: doc})
          this.respondedTest = doc
        })
      },
      getHtml2 () {
        window.axios.get('helloworld.html')
          .then(function (response) {
            logger.info('got html data', {data: response.data})
            var parser = new DOMParser()
            var doc = parser.parseFromString(response.data, 'text/html')
            logger.info('setting text', {html: doc})
            this.respondedTest = doc
          })
      }
    },
    mounted () {
/*      logger.info('script1')
      let script = document.createElement('script')
      script.setAttribute('src', 'assets/js/vendor/jquery-2.2.4.min.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script2')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/vendor/jquery.waypoints.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script3')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/menu.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script4')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/mobile-menu.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script5')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/vendor/jquery-ui.min.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script6')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/pricing.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script7')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/vendor/slick.min.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script8')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/vendor/dragscrollable.min.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script9')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/vendor/device.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script10')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/carousel.js')
      script.async = true
      document.head.appendChild(script)

      logger.info('script11')
      script = document.createElement('script')
      script.setAttribute('src', 'assets/js/style-switcher.js')
      script.async = true
      document.head.appendChild(script) */
    }
  }
</script>

<style scoped>

</style>
