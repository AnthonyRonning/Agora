<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <profile></profile>
      </main>
    </v-app>
  </div>
</template>

<script>
  import Profile from '../components/profile'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading profile')

  export default {
    name: 'profile-view',
    props: ['user'],
    components: {
      Appheader,
      Profile
    }
  }
</script>

<style scoped>

</style>
