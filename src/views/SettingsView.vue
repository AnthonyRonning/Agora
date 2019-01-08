<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <settings></settings>
      </main>
    </v-app>
  </div>
</template>

<script>
  import Settings from '../components/Settings'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading settings')
  export default {
    name: 'settings-view',
    props: ['user'],
    components: {
      Appheader,
      Settings
    }
  }
</script>

<style scoped>

</style>
