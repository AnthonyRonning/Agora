<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <order v-bind:user=user></order>
      </main>
    </v-app>
  </div>
</template>

<script>
  import Order from '../components/Orders'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading orders')

  export default {
    name: 'order-view',
    props: ['user'],
    components: {
      Appheader,
      Order
    }
  }
</script>

<style scoped>

</style>
