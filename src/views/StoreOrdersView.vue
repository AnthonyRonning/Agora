<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <store-orders v-bind:user=user></store-orders>
      </main>
    </v-app>
  </div>
</template>

<script>
  import StoreOrders from '../components/StoreOrders'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading store orders')

  export default {
    name: 'store-order-view',
    props: ['user'],
    components: {
      StoreOrders,
      Appheader
    }
  }
</script>

<style scoped>

</style>
