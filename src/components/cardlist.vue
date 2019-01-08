<template>
  <v-flex xs3 class="store-card">
    <v-card>
      <v-img
        class="white--text"
        height="200px"
        src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
      >
        <v-container fill-height fluid>
          <v-layout fill-height>
            <v-flex xs12 align-end flexbox>
              <span class="headline">{{ title }} </span>
            </v-flex>
          </v-layout>
        </v-container>
      </v-img>
      <v-card-title>
        <div>
          <span>Name: {{ username }} </span><br>
          <span>Description: {{ description }}</span><br>
        </div>
      </v-card-title>
      <v-card-actions>
        <v-btn
          flat color="orange"
          @click="$emit('visit')">Visit Store</v-btn>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
  export default {
    name: 'cardlist',
    props: ['title', 'username', 'description'],
    methods: {
      loadUser (username) {
        this.$router.push({ path: `/profile/${username}/` })
      }
    }
  }
</script>

<style scoped>

</style>
