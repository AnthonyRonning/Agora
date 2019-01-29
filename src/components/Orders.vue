<template>
  <v-container>
    <v-container grid-list-xl fluid>
      <div class="text-lg-center"
           v-if="loading">
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>
      <div class="text-lg-center"
           v-if="ordersEmpty && !loading">
        <v-layout row wrap>
          <v-flex>
            <v-card
              height="100px">
              <br/><h2>Order List is empty...</h2>
            </v-card>
          </v-flex>
        </v-layout>
      </div>
      <v-layout row wrap>
        <v-flex xs12
                v-for="(order, index) in orderList"
                :key="index"
                v-if="orderReady">
          <v-card>
            <ordertable
              v-bind:order="order"
              v-on:updateCart="updateCart"></ordertable>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
  import Ordertable from './ordertable'
  const logger = require('heroku-logger')
  var ORDER_LIST = 'private/orders.json'
  var ORDER_DIR_LOC = 'private/orders/'
  // var STORE_ITEMS_LIST = 'public/items.json'

  export default {
    name: 'Orders',
    data: () => ({
      blockstack: window.blockstack,
      orderList: [],
      vendorsItems: [],
      props: ['user'],
      orderReady: false,
      loading: true
    }),
    created () {
      this.getOrderList()
    },
    methods: {
      getOrderList () {
        this.blockstack.getFile(ORDER_LIST, { decrypt: true }) // decryption is enabled by default
          .then((OrderListJson) => {
            var orders = JSON.parse(OrderListJson || '[]')
            if (orders.length !== 0) {
              this.orderList = orders
              logger.info('grabbed order list for user', {orderList: this.orderList})
              this.getOrderDetails()
            } else {
              this.loading = false
            }
          })
      },
      getOrderDetails () {
        // var blockstack = this.blockstack

        // load all orders
        for (var c = 0; c < this.orderList.length; c++) {
          // var orderId = this.orderList[c].orderId
          logger.info('Getting order details', {order: this.orderList[c]})
          // logger.info('order json parsed', {order: JSON.parse(this.orderList[c])})
          // var vendor = this.orderList[c].vendor
          // const options = { username: vendor, decrypt: false, verify: false }
          // get order items
          this.pullOrder(this.orderList[c], c)
        }
      },
      pullOrder (order, index) {
        var orderLoc = ORDER_DIR_LOC + order.orderId + '.json'
        this.blockstack.getFile(orderLoc, {decrypt: true})
          .then((orderDetailsJson) => {
            logger.info('grabbed order', { orderId: order.orderId, orderDetails: orderDetailsJson })
            if (orderDetailsJson !== null) {
              var orderDetails = JSON.parse(orderDetailsJson || '[]')
              this.orderList[index] = orderDetails
              this.orderList[index].ready = true
              logger.info('order ready: ' + this.orderList[index])
              var ready = this.orderList.every(order => order.ready === true)
              if (ready === true) {
                logger.info('unsorted order list', { orderList: this.orderList })
                this.orderList.sort(function (a, b) {
                  return new Date(b.dateCreated) - new Date(a.dateCreated)
                })
                logger.info('sorted order list', { orderList: this.orderList })
                this.orderReady = true
                this.loading = false
              } else {
                logger.info('order not ready to load: ' + this.orderList[index])
              }
            } else {
            }
          })
          .catch((orderError) => {
            logger.error('could not resolve order: ' + orderError)
          })
      },
      matchVendorItems (vendorItems) {
        logger.debug('matching vendor items to cart', { vendorItems: vendorItems })
        var vI = this.orderList.findIndex(x => x.vendor === vendorItems.vendor)
        if (vI !== -1) {
          logger.debug('matched a vendor to vendorCart')
          for (var i = 0; i < this.orderList[vI].itemList.length; i++) {
            logger.debug('checking cart item #' + i)
            this.orderList[vI].itemList[i] = this.fillInVendorItemDetails(this.orderList[vI].itemList[i], vendorItems.items)
            logger.debug('new cart item info', { cartItem: this.orderList[vI].itemList[i] })
          }
        }

        // this vendor cart is now ready, check for if all carts are ready now
        // todo not ideal
        this.orderList[vI].ready = true
        this.loading = false
        var ready = this.orderList.every(cart => cart.ready === true)
        if (ready === true) {
          this.orderReady = true
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
        this.blockstack.getFile(ORDER_LIST, { decrypt: true }) // decryption is enabled by default
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
            return this.blockstack.putFile(ORDER_LIST, JSON.stringify(carts), { encrypt: true })
          })
      }
    },
    computed: {
      ordersEmpty () {
        return this.orderList === null || this.orderList === undefined || this.orderList.length === 0
      }
    },
    components: {
      Ordertable
    }
  }
</script>

<style scoped>

</style>
