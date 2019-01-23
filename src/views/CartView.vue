<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <cart v-bind:user=user></cart>
      </main>
    </v-app>
  </div>
</template>

<script>
  import Cart from '../components/Cart'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading cart')
  export default {
    name: 'settings-view',
    props: ['user'],
    components: {
      Appheader,
      Cart
    }
  }
</script>

<style scoped>

</style>
