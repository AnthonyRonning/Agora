<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-toolbar color="primary" dark>

          <v-toolbar-title>Following </v-toolbar-title>

          <div class="text-xs-center"
               v-if="loading">
            <v-progress-circular
              :size="25"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </div>

          <v-spacer></v-spacer>

        </v-toolbar>
        <v-list>
          <v-list-tile
            v-for="store in followingList"
            :key="store.name"
            avatar
            @click="loadUser(store.username)"
          >
            <v-list-tile-action>
              <v-icon v-if="store.fav" color="pink">star</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title v-text="store.name"></v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-avatar>
              <img :src="store.avatar ? store.avatar : '/avatar-placeholder.png'" class="avatar">
            </v-list-tile-avatar>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  const logger = require('heroku-logger')
  var PRIVATE_FRIENDS_LIST = 'private/following.json'
  export default {
    name: 'following',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      followingList: [],
      loading: true
    }),
    mounted () {
      this.fetchData()
    },
    methods: {
      fetchData () {
        const blockstack = this.blockstack
          // Get followingList list
        var userData = blockstack.loadUserData()
        var username = userData.username
        logger.info('Grabbing followingList list', { username: username })
        blockstack.getFile(PRIVATE_FRIENDS_LIST, { decrypt: true })
            .then((followingListJson) => {
              if (followingListJson !== null) {
                logger.info('parsing followingList list: ' + followingListJson)
                var followListParsed = JSON.parse(followingListJson || '[]')
                logger.info(followListParsed.toString())
                this.followingList = followListParsed
                this.loading = false
              } else {
                this.loading = false
                logger.info('followingList list empty')
              }
            })
          .catch((error) => {
            logger.error('could not get followingList list: ' + error, {username: username})
            this.loading = false
          })
      },
      loadUser (username) {
        this.$router.push({ path: `/profile/${username}/` })
      }
    }
  }
</script>

<style scoped>
  @import '../../node_modules/vuetify/dist/vuetify.min.css';

</style>
