<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <view-item></view-item>
      </main>
    </v-app>
  </div>
</template>

<script>
  import ViewItem from '../components/ViewItem'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading viewitem')
  export default {
    name: 'settings-view',
    props: ['user'],
    components: {
      Appheader,
      ViewItem
    }
  }
</script>

<style scoped>

</style>
