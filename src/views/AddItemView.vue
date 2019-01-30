<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <add-item v-bind:user=user></add-item>
      </main>
    </v-app>
  </div>
</template>

<script>
  import AddItem from '../components/AddItem'
  import Appheader from '../components/appheader'
  const logger = require('heroku-logger')

  logger.info('loading additem')
  export default {
    name: 'settings-view',
    props: ['user'],
    components: {
      Appheader,
      AddItem
    }
  }
</script>

<style scoped>

</style>
