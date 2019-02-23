<template>
  <div id="app">
    <landing v-if="! blockstack.isUserSignedIn() && ! blockstack.isSignInPending()"></landing>
    <!--<dashboard v-if="user" :user="user"></dashboard>-->
    <router-view :key="$route.fullPath" :user="user" v-if="blockstack.isUserSignedIn()"></router-view>
  </div>
</template>

<script>

import Landing from './components/Landing2.vue'
import Home from './components/Home.vue'
// import Raven from 'raven-js'
const logger = require('heroku-logger')

export default {
  name: 'app',
  components: {Landing, Home},
  beforeMount () {
    const blockstack = this.blockstack
    if (blockstack.isUserSignedIn()) {
      this.userData = blockstack.loadUserData()
      this.user = new blockstack.Person(this.userData.profile)
      this.user.username = this.userData.username

      logger.info('user logged in', { username: this.user.username })
      /* Raven.captureBreadcrumb({
        message: 'User Signed In',
        category: 'action',
        data: {
          username: this.user.name(),
          id: this.user.username
        }
      })
      Raven.setUserContext({
        username: this.user.name(),
        id: this.user.username
      }) */
    } else if (blockstack.isSignInPending()) {
      blockstack.handlePendingSignIn()
      .then((userData) => {
        this.user = new blockstack.Person(userData.profile)
        this.user.username = userData.username

        logger.info('user logged in', { username: this.user.username })

        /* Raven.captureBreadcrumb({
          message: 'User Signed In',
          category: 'action',
          data: {
            username: this.user.name(),
            id: this.user.username
          }
        })
        Raven.setUserContext({
          username: this.user.name(),
          id: this.user.username
        }) */
        window.location = window.location.origin
      })
    } else {
      this.$router.push('/login')
    }
  },
  data () {
    return {
      blockstack: window.blockstack,
      user: this.user
    }
  }
}
</script>

<style src="./assets/sass/app.scss" lang="scss"></style>
