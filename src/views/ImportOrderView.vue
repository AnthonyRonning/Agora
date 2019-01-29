<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <import-order v-bind:user=user></import-order>
      </main>
    </v-app>
  </div>
</template>

<script>
  import ImportOrder from '../components/ImportOrder'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading import order')
  export default {
    name: 'settings-view',
    props: ['user'],
    components: {
      Appheader,
      ImportOrder
    }
  }
</script>

<style scoped>

</style>
