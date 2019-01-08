<template>
  <div id="wrapper">
    <v-app>
      <main>
        <appheader v-bind:user=user></appheader>
        <following></following>
      </main>
    </v-app>
  </div>
</template>

<script>
  import Following from '../components/Following'
  import Appheader from '../components/appheader'
  export default {
    name: 'following-view',
    props: ['user'],
    components: {
      Following,
      Appheader
    }
  }
</script>

<style scoped>

</style>
