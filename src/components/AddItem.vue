<template>
  <v-app>
    <div class="AddItem">
      <div class="container">
        <div class="row">
          <div class="col-md-8 col-md-offset-2">
            <h2 class="user-info">
              <v-card flat>
                <v-form ref="validItemForm" v-model="validItem" lazy-validation>
                  <v-text-field
                    v-model="itemInformation.name"
                    :rules="nameRules"
                    :counter="20"
                    label="Name"
                    required
                  ></v-text-field>
                  <v-textarea
                    v-model="itemInformation.description"
                    :rules="descriptionRules"
                    :counter="1000"
                    label="Description"
                    required
                  ></v-textarea>
                  <v-text-field
                    v-model.number="itemInformation.price"
                    type="number"
                    :rules="priceRules"
                    v-on:keypress="isNumber(event)"
                    label="Price"
                    required
                  ></v-text-field>
                  <v-select
                    v-model="itemInformation.currency"
                    required
                    :items="currencyOptions"
                    :rules="currencyRules"
                    label="Currency"
                  ></v-select>
                  <upload-btn
                    :fileChangedCallback="fileChanged"
                    title="Upload Photo"
                    accept=".png"
                  >

                  </upload-btn>
                  <v-btn
                    :disabled="!validItem"
                    @click="submitItem"
                  >
                    submit
                  </v-btn>
                  <v-btn @click="clearItem">clear</v-btn>
                </v-form>
              </v-card>
            </h2>
          </div>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
  import UploadButton from 'vuetify-upload-button'
  const logger = require('heroku-logger')
  var ITEMS_FILE = 'public/items.json'
  var ITEM_DIR_LOC = 'public/item/'
  var ITEM_PHOTO_DIR_LOC = 'public/item/photos/'

  export default {
    name: 'AddItem',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      validItem: false,
      nameField: '',
      descriptionField: '',
      priceField: '',
      currencyField: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 20) || 'Name must be less than 20 characters'
      ],
      descriptionRules: [
        v => !!v || 'Description is required',
        v => (v && v.length <= 1000) || 'Description must be less than 1000 characters'
      ],
      priceRules: [
        v => !!v || 'Price is required'
      ],
      currencyRules: [
        v => !!v || 'Currency is required'
      ],
      currencyOptions: [
        'Bitcoin'
      ],
      itemInformation: {
        id: '',
        name: '',
        description: '',
        price: '',
        currency: '',
        photoLocation: ''
      },
      itemPhotoFile: '',
      items: []
    }),
    mounted () {
      this.fetchItems()
    },
    methods: {
      submitItem () {
        if (this.$refs.validItemForm.validate()) {
          const blockstack = this.blockstack

          // determine item number
          var itemNum = 1
          if (typeof this.items !== 'undefined' && this.items.length > 0) {
            var maxItemId = Math.max.apply(Math, this.items.map(function (o) { return o.id }))
            itemNum = maxItemId + 1
          }
          this.itemInformation.id = itemNum

          // upload photo
          var itemPhotoLoc = ITEM_PHOTO_DIR_LOC + this.itemInformation.id + '.png'
          logger.info('Saving photo', { item: this.itemInformation })
          blockstack.putFile(itemPhotoLoc, this.itemPhotoFile, { encrypt: false })
            .then((photoLoc) => {
              if (photoLoc !== null) {
                this.itemInformation.photoLocation = photoLoc

                // saving item
                logger.info('Saving item', { item: this.itemInformation })
                var itemLoc = ITEM_DIR_LOC + this.itemInformation.id + '.json'
                blockstack.putFile(itemLoc, JSON.stringify(this.itemInformation), { encrypt: false })

                // add item to items array
                var itemObj = {
                  id: this.itemInformation.id,
                  name: this.itemInformation.name,
                  price: this.itemInformation.price,
                  currency: this.itemInformation.currency,
                  photoLocation: this.itemInformation.photoLocation
                }
                // wipe out list if troubleshooting
                // this.items = JSON.parse('[]')
                this.items.push(itemObj)

                // saving items list
                logger.info('Saving items list', { item: this.items })
                return blockstack.putFile(ITEMS_FILE, JSON.stringify(this.items), { encrypt: false })
              }
            })
        }
      },
      clearItem () {
        this.$refs.validItemForm.reset()
      },
      fetchItems () {
        const blockstack = this.blockstack
        // Get Public Info
        blockstack.getFile(ITEMS_FILE, { decrypt: false }) // decryption is enabled by default
          .then((ItemsJson) => {
            if (ItemsJson !== null) {
              var items = JSON.parse(ItemsJson || '[]')
              this.items = items
            }
          })
      },
      isNumber: function (evt) {
        evt = (evt) || window.event
        var charCode = (evt.which) ? evt.which : evt.keyCode
        if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
          evt.preventDefault()
        } else {
          return true
        }
      },
      fileChanged (file) {
        this.itemPhotoFile = file
      }
    },
    components: {
      'upload-btn': UploadButton
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
</style>
