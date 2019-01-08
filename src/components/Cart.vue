<template>
  <v-container>
    <v-container grid-list-md fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card>
            <carttable
            v-bind:vendorName="test"
            v-bind:desserts="desserts"></carttable>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
  import carttable from '../components/carttable'
  export default {
    name: 'Cart',
    data: () => ({
      blockstack: window.blockstack,
      desserts: [],
      test: 'testprop'
    }),
    created () {
      this.initialize()
    },
    methods: {
      initialize () {
        this.desserts = [
          {
            name: 'Frozen Yogurt',
            quantity: 1,
            price: 6.0
          },
          {
            name: 'Ice cream sandwich',
            quantity: 2,
            price: 2.0
          },
          {
            name: 'Eclair',
            quantity: 1,
            price: 1.0
          },
          {
            name: 'Cupcake',
            quantity: 1,
            price: 1.0
          },
          {
            name: 'Gingerbread',
            quantity: 1,
            price: 0.1
          }
        ]
      }
    },
    components: {
      carttable
    }
  }
</script>

<style scoped>

</style>
