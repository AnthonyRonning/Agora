<template>
  <v-container fluid fill-height>
    <v-layout row wrap justify-center fill-height>
      <cardlist
        v-for="(market, index) in featured"
        v-bind:key="market.id"
        v-bind:title="market.title"
        v-bind:username="market.username"
        v-bind:description="market.description"
        v-on:visit="loadUser(market.username)"
      ></cardlist>
    </v-layout>
  </v-container>
</template>

<script>
  import cardlist from '../components/cardlist'
  var PUBLIC_KEY = 'public/key.json'
  var { getPublicKeyFromPrivate } = require('blockstack')
  const logger = require('heroku-logger')
  export default {
    name: 'home',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      followingList: [],
      loading: true,
      featured: [
        {
          id: 1,
          title: 'Cycryptr',
          username: 'cycryptr.id',
          description: 'Store of the coolest person'
        },
        {
          id: 2,
          title: 'Cycryptr',
          username: 'cycryptr.id',
          description: 'Store of the coolest person'
        },
        {
          id: 3,
          title: 'Cycryptr',
          username: 'cycryptr.id',
          description: 'Store of the coolest person'
        },
        {
          id: 4,
          title: 'test',
          username: 'test.id',
          description: 'Store of the lamest person'
        }
      ]
    }),
    mounted () {
      this.ensurePubKey()
    },
    methods: {
      loadUser (username) {
        this.$router.push({ path: `/profile/${username}/` })
      },
      ensurePubKey () {
        // store public key if not currently loaded
        this.blockstack.getFile(PUBLIC_KEY, { decrypt: false }) // decryption is enabled by default
          .then((pubKeyJson) => {
            var pubKeyExists = JSON.parse(pubKeyJson || '')
            if (!pubKeyExists) {
              var pubKey = getPublicKeyFromPrivate(this.blockstack.loadUserData().appPrivateKey)
              logger.info('Saving public key', { publicKey: pubKey })
              this.blockstack.putFile(PUBLIC_KEY, JSON.stringify(pubKey), { encrypt: false })
            }
          })
      }
    },
    components: {
      cardlist
    }
  }
</script>

<style scoped>
  .store-card {
    margin: 10px
  }

</style>
