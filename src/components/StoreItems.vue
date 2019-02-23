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
        </div>
        <v-container fluid fill-height>
          <v-layout row wrap justify-center fill-height fluid>
            <shopitemlist
              v-for="(item, index) in storeItems"
              v-bind:key="item.id"
              v-bind:name="item.name"
              v-bind:price="item.price"
              v-bind:description="item.description"
              v-bind:currency="item.currency"
              v-bind:photoLocation="item.photoLocation"
              v-on:view="loadItem(item.id)"
              v-on:remove="removeItem(item.id)"
            ></shopitemlist>
          </v-layout>
        </v-container>
      </div>
    </div>
  </v-app>
</template>

<script>
  import shopitemlist from '../components/shopitemlist'
  const logger = require('heroku-logger')
  // var PRIVATE_STORAGE_FILE = 'private/privateInformation.json'
  // var PUBLIC_STORAGE_FILE = 'public/publicInformation.json'
  // var PRIVATE_FOLLOW_LIST = 'private/following.json' // TODO globalize
  var STORE_ITEMS_LIST = 'public/items.json'

  export default {
    name: 'storeitems',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      storeItems: [],
      person: '',
      username: '',
      userNotFound: false,
      loading: true
    }),
    mounted () {
    },
    created () {
      this.fetchData()
    },
    methods: {
      fetchData () {
        const blockstack = this.blockstack
        const username = this.user.username

        // get store items
        blockstack.getFile(STORE_ITEMS_LIST, {decrypt: false})
          .then((storeItemsJson) => {
            logger.info('grabbed store items for user', { username: username })
            this.loading = false
            if (storeItemsJson !== null) {
              var storeItems = JSON.parse(storeItemsJson || '[]')
              this.storeItems = storeItems
            }
          })
          .catch((storeItemsError) => {
            logger.error('could not resolve store items: ' + storeItemsError)
            this.loading = false
          })
      },
      loadItem (itemId) {
        this.$router.push({ path: `/profile/${this.user.username}/item/${itemId}` })
      },
      removeItem (itemId) {
        // find item in list
        var itemIndex = this.storeItems.findIndex(x => x.id === itemId)
        if (itemIndex === -1) {
          // todo toast error removing item
          return
        }

        this.storeItems.splice(itemIndex, 1)
        logger.info('Saving items list', { items: this.storeItems })
        this.blockstack.putFile(STORE_ITEMS_LIST, JSON.stringify(this.storeItems), { encrypt: false })
      }
    },
    components: {
      shopitemlist
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

  @import '../../node_modules/vuetify/dist/vuetify.min.css';
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

