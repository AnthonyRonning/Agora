<template>
  <v-flex xs3 class="store-item-card">
    <v-card>
      <v-img
        class="white--text"
        height="200px"
        :src="photoLocation"
      >
      </v-img>
      <v-card-title>
        <div>
          <span class="title">{{ name }}</span><br>
          <span>Price: {{ price }} {{ currency }} </span><br>
        </div>
      </v-card-title>
      <v-card-actions class="justify-center">
        <v-btn
          flat color="orange"
          @click="$emit('view')">View Details</v-btn>
        <v-btn
          flat color="orange"
          @click="$emit('add')">Add to cart</v-btn>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
  export default {
    name: 'cardlist',
    props: ['name', 'price', 'description', 'currency', 'photoLocation'],
    methods: {
    }
  }
</script>

<style scoped>
  @import '../../node_modules/vuetify/dist/vuetify.min.css';
  .title {
    font-size: 10px;
  }
</style>
