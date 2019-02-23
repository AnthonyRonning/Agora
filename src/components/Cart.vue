<template>
  <v-container>
    <v-container grid-list-xl fluid>
      <v-alert
        :value="removedItems"
        type="warning"
      >
        Removed deleted item(s) from your cart.
      </v-alert>
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
              <br/><h2>Cart is empty, get buying!</h2>
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
            v-on:updateCart="updateCart"
            v-on:createOrder="createOrder"></carttable>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
  import carttable from '../components/carttable'
  const logger = require('heroku-logger')
  const { encryptECIES } = require('blockstack/lib/encryption')

  var CART_LIST = 'private/cart.json'
  var ORDER_LIST = 'private/orders.json'
  var ORDER_DIR_LOC = 'private/orders/'
  var SHARED_ORDER_DIR_LOC = 'shared/orders/'
  var STORE_ITEMS_LIST = 'public/items.json'
  var PUBLIC_KEY = 'public/key.json'

  export default {
    name: 'Cart',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      cartList: [],
      vendorsItems: [],
      cartReady: false,
      loading: true,
      orderComplete: false,
      vendorOrderComplete: false,
      removedItems: false
    }),
    created () {
      this.getOrderList()
    },
    methods: {
      getOrderList () {
        this.blockstack.getFile(PUBLIC_KEY, {decrypt: false})

        this.blockstack.getFile(CART_LIST, { decrypt: true }) // decryption is enabled by default
          .then((CartsJson) => {
            var carts = JSON.parse(CartsJson || '[]')
            if (carts.length !== 0) {
              this.cartList = carts
              logger.info('grabbed cart list for user', {cart: this.cartList})
              this.getOrderDetails()
            } else {
              this.loading = false
            }
          })
      },
      getOrderDetails () {
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

            // check if item still exists
            if (!this.itemExists(this.cartList[vI].itemList[i], vendorItems.items)) {
              this.cartList[vI].itemList.splice(i, 1)
              this.removedItems = true
              continue
            }
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
          if (this.removedItems) {
            logger.debug('saving new cart list because items were removed')
            this.saveCartList()
          }
        }
      },
      itemExists (item, storeItems) {
        var storeItemIndex = storeItems.findIndex(x => x.id === item.id)
        return storeItemIndex !== -1
      },
      fillInVendorItemDetails (item, storeItems) {
        var storeItem = storeItems.find(x => x.id === item.id)
        logger.info('matching vendor item to cart item', { storeItem: storeItem })
        item.price = storeItem.price
        item.name = storeItem.name
        return item
      },
      saveCartList () {
        // save cart list
        logger.info('Saving items list', { carts: this.cartList })
        return this.blockstack.putFile(CART_LIST, JSON.stringify(this.cartList), { encrypt: true })
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
      },
      createOrder (cart) {
        // get cart list
        this.blockstack.getFile(CART_LIST, { decrypt: true }) // decryption is enabled by default
          .then((CartsJson) => {
            var carts = JSON.parse(CartsJson || '[]')
            this.blockstack.getFile(ORDER_LIST, {decrypt: true}) // decryption is enabled by default
              .then((OrdersJson) => {
                var orderList = JSON.parse(OrdersJson || '[]')

                // create order
                var order = {
                  vendor: cart.vendor,
                  buyer: this.user.username,
                  itemList: cart.itemList,
                  cost: cart.itemList.map(v => v.price).reduce((sum, current) => sum + current, 0),
                  paid: 0,
                  txId: '',
                  cryptocurrency: 'bitcoin', // todo variable currency
                  fiatcurrency: 'USD', // todo variable currency
                  status: 'created',
                  dateCreated: new Date(),
                  shippingAddress: null,
                  dateOrdered: null,
                  dateUpdated: null,
                  dateShipped: null
                }

                order.id = this.createOrderId(cart.vendor, orderList)

                // save order
                logger.info('Saving order', {order: order})
                this.blockstack.putFile(ORDER_DIR_LOC + order.id + '.json', JSON.stringify(order), {encrypt: true})

                // encrypt order with vendor
                const options = { username: cart.vendor, decrypt: false, verify: false }
                this.blockstack.getFile(PUBLIC_KEY, options)
                  .then((publicKeyJson) => {
                    logger.info('grabbed public key for user', { username: cart.vendor })
                    if (publicKeyJson !== null) {
                      var pubKey = JSON.parse(publicKeyJson || '[]')
                      this.blockstack.putFile(
                        SHARED_ORDER_DIR_LOC + order.vendor + '/' + order.id + '.json',
                        JSON.stringify(encryptECIES(pubKey, JSON.stringify(order))),
                        {encrypt: false})
                    }
                  })
                  .catch((publicInfoError) => {
                    logger.error('could not resolve public info: ' + publicInfoError)
                  })
                  .finally(() => {
                    this.vendorOrderComplete = true
                    this.tryGoToOrders()
                  })

                // add order to order list
                var orderListItem = {
                  orderId: order.id,
                  vendor: cart.vendor,
                  customer: cart.buyer
                }

                // uncomment to wipe out
                // orderList = JSON.parse('[]')
                orderList.push(orderListItem)
                logger.info('Saving order list', {orderList: orderList})
                this.blockstack.putFile(ORDER_LIST, JSON.stringify(orderList), {encrypt: true})

                // remove order from cart
                if (carts.length !== 0) {
                  var cartIndex = carts.findIndex(x => x.vendor === cart.vendor)

                  // vendor not found in cart, not sure what to do, return
                  if (cartIndex === -1) {
                    return
                  } else {
                    // vendor found in cart, delete it
                    carts.splice(cartIndex, 1)
                  }
                } else {
                  // cart list is empty
                }

                // save cart list
                logger.info('Saving items list', {carts: carts})
                this.blockstack.putFile(CART_LIST, JSON.stringify(carts), {encrypt: true})
              })
              .finally(() => {
                this.orderComplete = true
                this.tryGoToOrders()
              })
          })
      },
      createOrderId (vendor, orderList) {
        var isDup = false
        var orderId = ''
        do {
          orderId = Math.floor(Math.random() * 99999999) + 1
          if (orderList.length > 0) {
            var index = orderList.findIndex(x => x.orderId === orderId)
            isDup = index !== -1
          }
        } while (isDup)
        return orderId
      },
      tryGoToOrders () {
        if (this.vendorOrderComplete && this.orderComplete) {
          this.$router.push({ path: `/orders` })
        }
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
  @import '../../node_modules/vuetify/dist/vuetify.min.css';

</style>
