<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <home></home>
      </main>
    </v-app>
  </div>
</template>

<script>
  import Home from '../components/Home'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading home')
  export default {
    name: 'home-view',
    props: ['user'],
    components: {
      Appheader,
      Home
    }
  }
</script>

<style scoped>

</style>
