<template>
  <v-app>
    <h2 align="center">Import Order</h2>
    <div class="ImportOrder">
      <div class="container">
        <v-alert
          :value="error"
          type="error"
        >
          Problem importing order
        </v-alert>
        <div class="row">
          <div class="col-md-8 col-md-offset-2">
            <h2 class="user-info">
              <v-layout row wrap>
                <v-flex xs12>
                  <v-card>
                    <v-form ref="validOrderForm" v-model="validOrder" lazy-validation>
                      <v-text-field
                        v-model="orderInformation.customerName"
                        :rules="nameRules"
                        :counter="100"
                        label="Customer Name"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="orderInformation.id"
                        :rules="orderNumberRules"
                        label="Order Number"
                        required
                      ></v-text-field>
                      <v-btn
                        :disabled="!validOrder"
                        @click="getOrder"
                      >
                        submit
                      </v-btn>
                    </v-form>
                  </v-card>
                </v-flex>
              </v-layout>
            </h2>
          </div>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
  const logger = require('heroku-logger')
  var SHARED_ORDER_DIR_LOC = 'shared/orders/'
  var STORE_ORDER_LIST = 'private/store/orders.json'
  var STORE_ORDER_DIR_LOC = 'private/store/orders/'
  const { decryptECIES } = require('blockstack/lib/encryption')
  import {
    loadUserData
  } from 'blockstack'

  export default {
    name: 'ImportOrder',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      validOrder: false,
      nameField: '',
      descriptionField: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 100) || 'Name must be less than 100 characters'
      ],
      orderNumberRules: [
        v => !!v || 'Order # is required'
      ],
      orderInformation: {
        id: '',
        customerName: ''
      },
      items: [],
      error: false
    }),
    mounted () {
    },
    methods: {
      getOrder () {
        // get order
        const orderOptions = { username: this.orderInformation.customerName, decrypt: false, verify: false }
        var orderLoc = SHARED_ORDER_DIR_LOC + this.user.username + '/' + this.orderInformation.id + '.json'
        this.blockstack.getFile(orderLoc, orderOptions)
          .then((ImportOrderJson) => {
            if (ImportOrderJson == null) {
              logger.error('could not find order')
              this.error = true
              throw new Error('Error finding order')
            }
            var orderEnc = JSON.parse(ImportOrderJson || '[]')

            // attempt to decrypt order
            var privateKey = loadUserData().appPrivateKey
            logger.info('encrypted info', { encryptedInfo: orderEnc })
            var order = JSON.parse(decryptECIES(privateKey, orderEnc))
            logger.info('decrypted info', { order: order })

            this.blockstack.getFile(STORE_ORDER_LIST, {decrypt: true})
              .then((OrdersJson) => {
                var orderList = JSON.parse(OrdersJson || '[]')

                // save order
                logger.info('Saving order', {order: order})
                this.blockstack.putFile(STORE_ORDER_DIR_LOC + order.buyer + order.id + '.json', JSON.stringify(order), {encrypt: true})

                // todo encrypt order with customer again
/*                const options = { username: cart.vendor, decrypt: false, verify: false }
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
                  }) */

                // add order to order list
                var orderListItem = {
                  orderId: order.id,
                  vendor: order.vendor,
                  customer: order.buyer
                }

                // uncomment to wipe out
                // orderList = JSON.parse('[]')
                orderList.push(orderListItem)
                logger.info('Saving order list', {orderList: orderList})
                this.blockstack.putFile(STORE_ORDER_LIST, JSON.stringify(orderList), {encrypt: true})
                this.error = false
              })
              .catch(() => {
                this.error = true
              })
              .finally(() => {
                this.orderComplete = true
                this.tryGoToOrders()
              })
          })
          .catch(() => {
            this.error = true
          })
      },
      tryGoToOrders () {
        if (this.orderComplete) {
          this.$router.push({ path: `/storeorders` })
        }
      }
    },
    components: {
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
  .user-info {
    margin-left: 10px;
  }
</style>
