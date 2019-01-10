<template>
  <v-container>
    <v-container grid-list-md fluid>
      <div class="text-lg-center"
           v-if="loading">
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>
      <div class="text-lg-center"
           v-if="cartEmpty && !loading">
        <v-layout row wrap>
          <v-flex>
            <v-card
              height="100px">
              <br/><h2>Cart is emtpy, get buying!</h2>
            </v-card>
          </v-flex>
        </v-layout>
      </div>
      <v-layout row wrap>
        <v-flex xs12
                v-for="(cart, index) in cartList"
                :key="index"
                v-if="cartReady">
          <v-card>
            <carttable
            v-bind:vendorName="cart.vendor"
            v-bind:cart="cart"
            v-on:updateCart="updateCart"></carttable>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
  import carttable from '../components/carttable'
  const logger = require('heroku-logger')
  var CART_LIST = 'private/cart.json'
  var STORE_ITEMS_LIST = 'public/items.json'

  export default {
    name: 'Cart',
    data: () => ({
      blockstack: window.blockstack,
      cartList: [],
      vendorsItems: [],
      cartReady: false,
      loading: true
    }),
    created () {
      this.getCartList()
    },
    methods: {
      getCartList () {
        this.blockstack.getFile(CART_LIST, { decrypt: true }) // decryption is enabled by default
          .then((CartsJson) => {
            var carts = JSON.parse(CartsJson || '[]')
            if (carts.length !== 0) {
              this.cartList = carts
              logger.info('grabbed cart list for user', {cart: this.cartList})
              this.getCartDetails()
            } else {
              this.loading = false
            }
          })
      },
      getCartDetails () {
        var blockstack = this.blockstack

        // load all vendors
        for (var c = 0; c < this.cartList.length; c++) {
          var vendorUsername = this.cartList[c].vendor
          const options = { username: vendorUsername, decrypt: false, verify: false }
          // get store items
          blockstack.getFile(STORE_ITEMS_LIST, options)
            .then((storeItemsJson) => {
              logger.info('grabbed store items for user', { username: vendorUsername })
              // this.loading = false todo store loading
              if (storeItemsJson !== null) {
                var storeItems = JSON.parse(storeItemsJson || '[]')
                var vendorItems = {
                  vendor: vendorUsername,
                  items: storeItems
                }
                this.matchVendorItems(vendorItems)
              } else {}
            })
            .catch((storeItemsError) => {
              logger.error('could not resolve store items: ' + storeItemsError)
            })
        }
      },
      matchVendorItems (vendorItems) {
        logger.debug('matching vendor items to cart', { vendorItems: vendorItems })
        var vI = this.cartList.findIndex(x => x.vendor === vendorItems.vendor)
        if (vI !== -1) {
          logger.debug('matched a vendor to vendorCart')
          for (var i = 0; i < this.cartList[vI].itemList.length; i++) {
            logger.debug('checking cart item #' + i)
            this.cartList[vI].itemList[i] = this.fillInVendorItemDetails(this.cartList[vI].itemList[i], vendorItems.items)
            logger.debug('new cart item info', { cartItem: this.cartList[vI].itemList[i] })
          }
        }

        // this vendor cart is now ready, check for if all carts are ready now
        // todo not ideal
        this.cartList[vI].ready = true
        this.loading = false
        var ready = this.cartList.every(cart => cart.ready === true)
        if (ready === true) {
          this.cartReady = true
        }
      },
      fillInVendorItemDetails (item, storeItems) {
        var storeItem = storeItems.find(x => x.id === item.id)
        logger.info('matching vendor item to cart item', { storeItem: storeItem })
        item.price = storeItem.price
        item.name = storeItem.name
        return item
      },
      updateCart (updatedCart) {
        // get cart list
        this.blockstack.getFile(CART_LIST, { decrypt: true }) // decryption is enabled by default
          .then((CartsJson) => {
            var carts = JSON.parse(CartsJson || '[]')

            // check if vendor in cart
            if (carts.length !== 0) {
              var cartIndex = carts.findIndex(x => x.vendor === updatedCart.vendor)

              // vendor not found in cart, not sure what to do, return
              if (cartIndex === -1) {
                return
              } else {
                // vendor found in cart, delete if empty or update list
                if (updatedCart.itemList.length === 0) {
                  carts.splice(cartIndex, 1)
                } else {
                  carts[cartIndex].itemList = updatedCart.itemList
                }
              }
            } else {
              // cart list is empty
            }

            // save cart list
            logger.info('Saving items list', { carts: carts })
            return this.blockstack.putFile(CART_LIST, JSON.stringify(carts), { encrypt: true })
          })
      }
    },
    computed: {
      cartEmpty () {
        return this.cartList === null || this.cartList === undefined || this.cartList.length === 0
      }
    },
    components: {
      carttable
    }
  }
</script>

<style scoped>

</style>
