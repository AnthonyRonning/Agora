<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <StoreItems v-bind:user=user></StoreItems>
      </main>
    </v-app>
  </div>
</template>

<script>
  import StoreItems from '../components/storeitems'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading store items view')

  export default {
    name: 'storeitems-view',
    props: ['user'],
    components: {
      Appheader,
      StoreItems
    }
  }
</script>

<style scoped>

</style>
