<template>
  <v-app>
    <div class="hello">
      <div class="container">
        <div class="row">
          <div class="text-xs-center"
               v-if="loading">
            <v-progress-circular
              :size="50"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </div>
          <div class="col-md-8 col-md-offset-2" v-if="!userNotFound && !loading">
            <h2 class="user-info">
              <v-layout>
                <v-flex >
                  <v-card>
                    <v-img
                      class="white--text"
                      height="200px"
                      :src="this.item.photoLocation"
                    >
                      <v-container fill-height fluid>
                        <v-layout fill-height>
                          <v-flex xs12 align-end flexbox>
                            <span class="headline">{{this.username}} </span>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-img>
                    <v-card-title>
                      <div>
                        <span>{{this.item.name}}</span><br>
                        <span>Description: {{this.item.description}}</span><br>
                        <span>Price: {{ this.item.price }} {{ this.item.currency }}</span><br>
                      </div>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn
                        flat color="orange"
                        @click="addToCart">Add To Cart</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-flex>
              </v-layout>
            </h2>
          </div>
          <div v-if="userNotFound" align="center">
            <img src="../assets/pictures/user-does-not-exist.jpg">
          </div>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
  const logger = require('heroku-logger')
  import {
    Person,
    lookupProfile
  } from 'blockstack'
  // var PRIVATE_STORAGE_FILE = 'private/privateInformation.json'
  // var PUBLIC_STORAGE_FILE = 'public/publicInformation.json'
  var ITEM_DIR_LOC = 'public/item/'

  export default {
    name: 'ViewItem',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      person: '',
      item: '',
      username: '',
      userNotFound: false,
      loading: true
    }),
    mounted () {
      this.fetchData()
    },
    created () {
      this.profileId = this.$route.params.id
      this.itemId = this.$route.params.itemId
    },
    methods: {
      fetchData () {
        const blockstack = this.blockstack
        const username = this.profileId

        logger.info('looking up profile', { username: username })
        lookupProfile(username)
          .then((profile) => {
            logger.info('found profile', { username: username })
            this.person = new Person(profile)
            this.username = username
          })
          .catch((error) => {
            logger.error('could not resolve profile: ' + error)
            this.userNotFound = true
            this.loading = false
          })

        // get item info
        // const options = { username: username, decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'}
        var itemLocation = ITEM_DIR_LOC + this.itemId + '.json'
        const options = { username: username, decrypt: false, verify: false }
        blockstack.getFile(itemLocation, options)
          .then((itemJson) => {
            logger.info('grabbed item file for user', { username: username })
            this.loading = false
            if (itemJson !== null) {
              var itemInfo = JSON.parse(itemJson || '[]')
              this.item = itemInfo
            }
          })
          .catch((publicInfoError) => {
            logger.error('could not resolve item info: ' + publicInfoError)
            this.loading = false
          })
      },
      addToCart () {

      }
    }
  }
</script>

<style scoped>

</style>
