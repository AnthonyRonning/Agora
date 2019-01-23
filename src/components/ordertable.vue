<template>
  <div>
    <v-toolbar flat color="white">
      <v-toolbar-title>
        <v-btn flat color="orange" @click="loadUser(order.vendor)">Vendor: {{ order.vendor }}</v-btn>
        <v-btn flat color="orange" @click="loadUser(order.buyer)">Customer: {{ order.buyer }}</v-btn>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-dialog v-model="dialog" max-width="450px">
        <v-snackbar
          v-model="snackbar"
          :timeout="3000"
          top
        >
          Copied!
          <v-btn
            color="pink"
            flat
            @click="snackbar = false"
          >
            Close
          </v-btn>
        </v-snackbar>

        <v-btn :disabled="isEmpty || order.txId !== ''" slot="activator" color="primary" dark class="mb-2" @click="getVendorAddress">Pay now: ${{ totalPrice }}</v-btn>
        <v-stepper v-model="stepper">
          <v-stepper-header>
            <v-stepper-step :complete="stepper > 1" step="1">Enter Address</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="stepper > 2" step="2">Pay Vendor</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="3">Notify Vendor</v-stepper-step>
          </v-stepper-header>


          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card>
                <v-card-text>
                  <div class="container" align="center">
                    <v-layout wrap>
                      <v-flex class="text-md-center">
                        <h3 class="text-md-center">Enter Shipping Address</h3>
                        <v-form ref="addressForm" v-model="validAddressForm" lazy-validation>
                          <v-textarea
                            v-model="submittedAddress"
                            :rules="addressRules"
                            :counter="300"
                            label="Enter shipping address..."
                            required
                          ></v-textarea>
                        </v-form>
                      </v-flex>
                    </v-layout>
                  </div>
                </v-card-text>
              </v-card>

              <v-btn
                color="primary"
                :disabled="!validAddressForm"
                @click="submitAddressForm"
              >
                Continue
              </v-btn>

            </v-stepper-content>


            <v-stepper-content step="2">
              <v-card>
                <v-card-title>
                  <span class="headline">Total: {{ totalPrice }} {{ order.fiatcurrency}}</span>
                </v-card-title>

                <v-card-text>
                  <div class="container" align="center">
                    <v-layout wrap>
                      <v-flex class="text-md-center">
                        <canvas
                          :id="order.id"
                          height="150px"
                          width="150px"></canvas>
                        <h3 class="text-md-center">Send <v-btn flat @click="copyText(totalBtcPrice)">{{ totalBtcPrice }}<span style="padding-left:5px"></span> <v-icon>library_books</v-icon></v-btn> {{ order.cryptocurrency }} to:
                          <v-btn flat @click="copyText(vendorAddress)">{{ vendorAddress }}<span style="padding-left:5px"></span> <v-icon>library_books</v-icon></v-btn> </h3>
                        <div class="text-xs-center">
                          <v-chip>1 bitcoin = ~{{ Math.round(currentBtcTicker * 1) }} {{ order.fiatcurrency }}</v-chip>
                        </div>
                        <v-form ref="txForm" v-model="validForm" lazy-validation>
                          <v-text-field
                            v-model="submittedTx"
                            :rules="bitcoinTxRules"
                            :counter="64"
                            label="Enter Completed Transaction ID..."
                            required
                          ></v-text-field>
                        </v-form>
                      </v-flex>
                    </v-layout>
                  </div>
                </v-card-text>
              </v-card>

              <v-btn
                flat
                @click="stepper = 1">Back</v-btn>

              <v-btn
                color="primary"
                :disabled="!validForm"
                v-on:click="submitTx()"
              >
                Submit
              </v-btn>
            </v-stepper-content>


            <v-stepper-content step="3">
              <v-card>
                <v-card-text>
                  <div class="container" align="center">
                    <v-layout wrap>
                      <v-flex class="text-md-center">
                        <h3 class="text-md-center">Order Complete! <br/> Notify {{ order.vendor }} of your order #{{ order.id }}</h3>
                        <v-btn
                          color="primary"
                          :href="`mailto:${vendorEmail}`">Email Vendor</v-btn>
                      </v-flex>
                    </v-layout>
                  </div>
                </v-card-text>
              </v-card>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-dialog>
    </v-toolbar>

    <h4 class="ml-5">Order ID: {{ order.id }}</h4>
    <h4 class="ml-5">Status: {{ order.status }}</h4>
    <h4 class="ml-5" v-if="order.dateCreated !== null && order.status === 'created'">Date Created: {{ dateCreated }}</h4>
    <h4 class="ml-5" v-if="order.dateOrdered !== null && order.status === 'ordered'">Date Ordered: {{ dateOrdered }}</h4>
    <h4 class="ml-5" v-if="order.shippingAddress && order.shippingAddress !== null && order.shippingAddress !== ''">Shipping Address: {{ order.shippingAddress }}</h4>
    <v-data-table
      :headers="headers"
      :items="order.itemList"
      class="elevation-1"
      hide-actions
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">${{ props.item.price }}</td>
        <td class="text-xs-right">{{ props.item.quantity }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  var dateFormat = require('dateformat')
  const logger = require('heroku-logger')
  import QRious from 'qrious'
  const { encryptECIES } = require('blockstack/lib/encryption')
  var PUBLIC_STORAGE_FILE = 'public/publicInformation.json'
  var ORDER_DIR_LOC = 'private/orders/'
  var SHARED_ORDER_DIR_LOC = 'shared/orders/'
  var PUBLIC_KEY = 'public/key.json'

  var HttpClient = function () {
    this.get = function (aUrl, aCallback) {
      var anHttpRequest = new XMLHttpRequest()
      anHttpRequest.onreadystatechange = function () {
        if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200) {
          aCallback(anHttpRequest.responseText)
        }
      }

      anHttpRequest.open('GET', aUrl, true)
      anHttpRequest.send(null)
    }
  }
  export default {
    Name: 'ordertable',
    props: ['order'],
    data: () => ({
      dialog: false,
      blockstack: window.blockstack,
      validForm: false,
      validAddressForm: false,
      stepper: 0,
      bitcoinTxRules: [
        v => !!v || 'Transaction is required',
        v => (v && v.length <= 64) || 'Max size of a bitcoin tx 64 characters'
      ],
      addressRules: [
        v => !!v || 'Address is required',
        v => (v && v.length <= 300) || 'Max size of a address is limited to 300 characters'
      ],
      submittedTx: null,
      submittedAddress: null,
      headers: [
        {
          text: 'Item name',
          align: 'left',
          value: 'name'
        },
        { text: 'Price', value: 'price', align: 'right' },
        { text: 'Quantity', value: 'quantity', align: 'right' }
      ],
      paymentComplete: false,
      editedIndex: -1,
      editedItem: {
        name: '',
        price: 0,
        quantity: 0
      },
      defaultItem: {
        name: '',
        price: 0,
        quantity: 0
      },
      vendorAddress: null,
      vendorEmail: null,
      currentBtcTicker: null,
      totalBtcPrice: null,
      snackbar: false
    }),

    computed: {
      isEmpty () {
        return this.order.itemList.length === 0
      },
      totalPrice: function () {
        // `this` points to the vm instance
        return this.order.itemList
          .map(v => v.price)
          .reduce((sum, current) => sum + current, 0)
      },
      dateCreated () {
        return dateFormat(this.order.dateCreated, 'longDate')
      },
      dateUpdated () {
        return dateFormat(this.order.dateUpdated, 'longDate')
      },
      dateOrdered () {
        return dateFormat(this.order.dateOrdered, 'longDate')
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      currentBtcTicker (val) {
        var price = this.totalPrice / val
        this.totalBtcPrice = Math.round(price * 100000000) / 100000000
      }
    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
      },

      deleteItem (item) {
        const index = this.order.itemList.indexOf(item)

        confirm('Are you sure you want to delete this item?') &&
        this.order.itemList.splice(index, 1) &&
        this.$emit('updateCart', this.order)
      },
      getVendorAddress () {
        const options = { username: this.order.vendor, decrypt: false, verify: false }
        this.blockstack.getFile(PUBLIC_STORAGE_FILE, options)
          .then((publicInformationJson) => {
            logger.info('grabbed public information file for user', { username: this.order.vendor })
            this.loading = false
            if (publicInformationJson !== null) {
              var publicInformation = JSON.parse(publicInformationJson || '[]')
              this.vendorAddress = publicInformation.bitcoinAddress // todo dynamic address
              this.vendorEmail = publicInformation.email
              var qr = new QRious({
                element: document.getElementById(this.order.id),
                value: this.vendorAddress,
                background: 'white', // background color
                foreground: 'black', // foreground color
                backgroundAlpha: 1,
                foregroundAlpha: 1,
                level: 'L', // Error correction level of the QR code (L, M, Q, H)
                mime: 'image/png', // MIME type used to render the image for the QR code
                size: 200, // Size of the QR code in pixels.
                padding: null // padding in pixels
              })
              logger.info(qr)
            }
          })
          .catch((publicInfoError) => {
            logger.error('could not resolve public info: ' + publicInfoError)
            this.loading = false
          })
        this.getBtcTicker()
      },
      getBtcTicker () {
        var client = new HttpClient()
        var self = this
        client.get('https://www.cryptonator.com/api/ticker/btc-usd', function (responseJson) {
          if (responseJson !== null) {
            var response = JSON.parse(responseJson)
            var price = response.ticker.price
            logger.info('got btc price', { btcPriceInfo: price })
            self.currentBtcTicker = price
          }
        })
      },
      submitTx () {
        logger.info('trying to submit order')
        if (this.$refs.txForm.validate()) {
          const blockstack = this.blockstack

          // save order
          this.order.txId = this.submittedTx
          this.order.shippingAddress = this.submittedAddress
          this.order.status = 'ordered'
          this.order.dateOrdered = new Date()
          logger.info('Saving order', {order: this.order})
          blockstack.putFile(ORDER_DIR_LOC + this.order.id + '.json', JSON.stringify(this.order), {encrypt: true})

          // encrypt order with vendor
          const options = { username: this.order.vendor, decrypt: false, verify: false }
          blockstack.getFile(PUBLIC_KEY, options)
            .then((publicKeyJson) => {
              logger.info('grabbed public key for user', { username: this.order.vendor })
              if (publicKeyJson !== null) {
                var pubKey = JSON.parse(publicKeyJson || '[]')
                this.blockstack.putFile(
                  SHARED_ORDER_DIR_LOC + this.order.vendor + '/' + this.order.id + '.json',
                  JSON.stringify(encryptECIES(pubKey, JSON.stringify(this.order))),
                  {encrypt: false})
              }
            })
            .catch((publicInfoError) => {
              logger.error('could not resolve public info: ' + publicInfoError)
            })
          this.paymentComplete = true
          this.$emit('submitTx', this.order)
          this.stepper = 3
        }
      },
      submitAddressForm () {
        if (this.$refs.addressForm.validate()) {
          this.stepper = 2
        }
      },
      loadUser (username) {
        this.$router.push({ path: `/profile/${username}/` })
      },
      close () {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
      },

      save () {
        if (this.editedIndex > -1) {
          Object.assign(this.order.itemList[this.editedIndex], this.editedItem)
        } else {
          this.order.itemList.push(this.editedItem)
        }
        this.close()
      },
      copyText (textToCopy) {
        this.copied = false

        // Create textarea element
        const textarea = document.createElement('textarea')

        // Set the value of the text
        textarea.value = textToCopy

        // Make sure we cant change the text of the textarea
        textarea.setAttribute('readonly', '')

        // Hide the textarea off the screnn
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'

        // Add the textarea to the page
        document.body.appendChild(textarea)

        // Copy the textarea
        textarea.select()

        try {
          var successful = document.execCommand('copy')
          logger.info('succeeded in copying content', {successful: successful})
          this.snackbar = true
          this.copied = true
        } catch (err) {
          this.copied = false
        }

        textarea.remove()
      }
    }
  }
</script>

<style scoped>
  .container {
    margin: 0 auto;
    background: none;
    display: inline;
    overflow: auto;
    z-index: 1;
    width: 300px;
  }
</style>
