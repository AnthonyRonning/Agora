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

            <v-btn icon
                   :to="{name: 'Cart'}">
              <v-badge color="green" overlap>
                <span slot="badge"
                      v-if="totalCartItems">{{ totalCartItems }}</span>
                <v-icon
                  medium
                >
                  shopping_cart
                </v-icon>
              </v-badge>
            </v-btn>

            <v-btn icon>
              <router-link :to="{name: 'Settings'}">
              <img :src="user && user.avatarUrl() ? user.avatarUrl() : '/avatar-placeholder.png'" class="avatar">
              </router-link>
            </v-btn>

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
  var CART_LIST = 'private/cart.json'

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
      ],
      totalCartItems: 0
    }),
    created () {
      this.getCartItems()
    },
    methods: {
      getCartItems () {
        this.blockstack.getFile(CART_LIST, { decrypt: true }) // decryption is enabled by default
          .then((CartsJson) => {
            var carts = JSON.parse(CartsJson || '[]')
            if (carts.length !== 0) {
              logger.info('grabbed cart list for user', {cart: carts})
              var totalItems = 0
              for (var i = 0; i < carts.length; i++) {
                totalItems += carts[i].itemList.length
              }
              this.totalCartItems = totalItems
            }
          })
      },
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
