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
              <small>
                {{ person ? person.name() : 'Nameless Person'}}'s Profile
              </small>

              <v-layout>
                <v-flex >
                  <v-card>
                    <v-img
                      class="white--text"
                      height="200px"
                      src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
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
                        <span>Name: {{this.publicInformation.name}}</span><br>
                        <span>Email: {{this.publicInformation.email ? this.publicInformation.email : ''}}</span><br>
                      </div>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn
                        flat color="orange"
                        @click="addFollow">Follow</v-btn>
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
        <v-container fluid fill-height>
          <v-layout row wrap justify-center fill-height fluid>
            <storeitemlist
              v-for="(item, index) in storeItems"
              v-bind:key="item.id"
              v-bind:name="item.name"
              v-bind:price="item.price"
              v-bind:description="item.description"
              v-bind:currency="item.currency"
              v-bind:photoLocation="item.photoLocation"
              v-on:view="loadItem(item.id)"
              v-on:add="addItem(item.id)"
            ></storeitemlist>
          </v-layout>
        </v-container>
      </div>
    </div>
  </v-app>
</template>

<script>
  import storeitemlist from '../components/storeitemlist'
  const logger = require('heroku-logger')
  import {
    Person,
    lookupProfile
  } from 'blockstack'
  // var PRIVATE_STORAGE_FILE = 'private/privateInformation.json'
  var PUBLIC_STORAGE_FILE = 'public/publicInformation.json'
  var PRIVATE_FOLLOW_LIST = 'private/following.json' // TODO globalize
  var STORE_ITEMS_LIST = 'public/items.json'
  var CART_LIST = 'private/cart.json'

  export default {
    name: 'profile',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      publicInformation: {
        name: '',
        email: ''
      },
      storeItems: [],
      person: '',
      username: '',
      userNotFound: false,
      loading: true
    }),
    mounted () {
      this.fetchData()
    },
    created () {
      this.profileId = this.$route.params.id
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

        // get store info
        // const options = { username: username, decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'}
        const options = { username: username, decrypt: false, verify: false }
        blockstack.getFile(PUBLIC_STORAGE_FILE, options)
          .then((publicInformationJson) => {
            logger.info('grabbed public information file for user', { username: username })
            this.loading = false
            if (publicInformationJson !== null) {
              var publicInformation = JSON.parse(publicInformationJson || '[]')
              this.publicInformation = publicInformation
            }
          })
          .catch((publicInfoError) => {
            logger.error('could not resolve public info: ' + publicInfoError)
            this.loading = false
          })

        // get store items
        blockstack.getFile(STORE_ITEMS_LIST, options)
          .then((storeItemsJson) => {
            logger.info('grabbed store items for user', { username: username })
            // this.loading = false todo store loading
            if (storeItemsJson !== null) {
              var storeItems = JSON.parse(storeItemsJson || '[]')
              this.storeItems = storeItems
            }
          })
          .catch((storeItemsError) => {
            logger.error('could not resolve store items: ' + storeItemsError)
            // this.loading = false
          })
      },
      addFollow () {
        // first grab follow list
        const blockstack = this.blockstack
        var userData = blockstack.loadUserData()
        var username = userData.username
        logger.info('Grabbing followingList list', { username: username })
        blockstack.getFile(PRIVATE_FOLLOW_LIST, { decrypt: true })
          .then((followListJson) => {
            var updateFollowList = false
            var followList = []
            var storeToFollow = {username: this.username, name: this.person.name(), avatar: this.person.avatarUrl()}
            if (followListJson) {
              logger.info('followingList list: ' + followListJson)
              followList = JSON.parse(followListJson || '[]')
              // check if user is already a friend
              var alreadyFollowing = followList.find(f => f.username === this.username)
              if (!alreadyFollowing) {
                followList.push(storeToFollow)
                updateFollowList = true
              } else {
                logger.info('store already following')
              }
            } else {
              logger.info('followingList list empty')
              followList = [ storeToFollow ]
              updateFollowList = true
            }
            if (updateFollowList) {
              logger.info('Saving private file', {file: PRIVATE_FOLLOW_LIST})
              blockstack.putFile(PRIVATE_FOLLOW_LIST, JSON.stringify(followList), {encrypt: true})
            }
          })
          .catch((error) => {
            logger.error('could not get/save followingList list: ' + error, {username: username})
            // todo throw error
          })
      },
      loadItem (itemId) {
        this.$router.push({ path: `/profile/${this.username}/item/${itemId}` })
      },
      addItem (itemId) {
        // get cart list
        this.blockstack.getFile(CART_LIST, { decrypt: true }) // decryption is enabled by default
          .then((CartsJson) => {
            var carts = JSON.parse(CartsJson || '[]')

            // check if vendor already in cart
            var cart = JSON.parse('[]')
            if (carts.length !== 0) {
              var cartIndex = carts.findIndex(x => x.vendor === this.profileId)

              // vendor not found in cart, add vendor and item
              if (cartIndex === -1) {
                cart = {
                  vendor: this.profileId,
                  itemList: [
                    {
                      id: itemId,
                      quantity: 1
                    }
                  ]
                }
                carts.push(cart)
              } else {
                // vendor found in cart, check if item exists. Add quantity if exists
                var itemIndex = carts[cartIndex].itemList.findIndex(x => x.id === itemId)
                if (itemIndex === -1) {
                  var newItem = {
                    id: itemId,
                    quantity: 1
                  }
                  carts[cartIndex].itemList.push(newItem)
                } else {
                  carts[cartIndex].itemList[itemIndex].quantity++
                }
              }
            } else {
              // cart list is empty
              cart = {
                vendor: this.profileId,
                itemList: [
                  {
                    id: itemId,
                    quantity: 1
                  }
                ]
              }
              carts.push(cart)
            }

            // save cart list
            logger.info('Saving items list', { carts: carts })
            return this.blockstack.putFile(CART_LIST, JSON.stringify(carts), { encrypt: true })
          })
      }
    },
    components: {
      storeitemlist
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

  input::placeholder {
    color: grey;
  }

  label {
    margin-bottom: 0;
    // width: 100%;
    cursor: pointer;
    input[type="checkbox"] {
      margin-right: 5px;
    }
  }
  .custom-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .list-group-item {
    &.completed label {
      text-decoration: line-through;
    }

    .delete {
      display: none;
    }

    &:hover .delete {
      display: inline;
      color: grey;
      &:hover {
        text-decoration: none;
        color: red;
      }
    }
  }

  .store-item-card {
    margin: 10px
  }
</style>

