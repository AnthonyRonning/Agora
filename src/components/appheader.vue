<template>
      <div class="row">
        <div>
          <v-navigation-drawer
            v-model="drawer"
            absolute
            temporary
          >
            <v-list class="pa-1">
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img :src="user && user.avatarUrl() ? user.avatarUrl() : '/avatar-placeholder.png'">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title>{{ user && user.username ? user.username : user && user.identityAddress ? user.identityAddress : '' }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>

            <v-list class="pt-0" dense>
              <v-divider></v-divider>

              <v-list-tile
                v-for="item in navItems"
                :key="item.title"
                :to="{name: item.location}"
              >
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>

                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-navigation-drawer>

          <v-toolbar dark color="primary">


            <v-toolbar-side-icon
              @click.stop="drawer = !drawer"
            >
            </v-toolbar-side-icon>

            <v-toolbar-title class="white--text">BlockMart - Decentralized Marketplace</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-text-field
              v-model="userSearch"
              append-icon="search"
              hide-details dark
              label="User Search..."
              v-on:keyup.enter="searchUser"
            >

            </v-text-field>

            <v-btn icon
                   :to="{name: 'Following'}">
              <v-icon>people</v-icon>
            </v-btn>

            <router-link :to="{name: 'Settings'}">
            <img :src="user && user.avatarUrl() ? user.avatarUrl() : '/avatar-placeholder.png'" class="avatar">
            </router-link>

            <v-menu offset-y>
              <v-btn icon
                slot="activator"
                color="primary"
                dark
              >
                <v-icon>more_vert</v-icon>

              </v-btn>
              <v-list>
                <v-list-tile
                  @click="signOut"
                >
                  <v-list-tile-title>Sign Out</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>

          </v-toolbar>
        </div>
      </div>
</template>

<script>
  const logger = require('heroku-logger')

  export default {
    name: 'appheader',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      userSearch: '',
      drawer: null,
      navItems: [
        { title: 'Home', icon: 'dashboard', location: 'Home' },
        { title: 'Add Item', icon: 'add', location: 'AddItem' },
        { title: 'About', icon: 'question_answer', location: 'Settings' }
      ]
    }),
    methods: {
      searchUser () {
        logger.info('searching for user: ' + this.userSearch)
        this.$router.push({ path: `/profile/${this.userSearch}/` })
      },
      signOut () {
        this.blockstack.signUserOut(window.location.href)
        this.$router.push('/login')
      }
    }
  }
</script>

<style scoped>

</style>
