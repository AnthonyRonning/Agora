<template>
  <v-app>
    <v-container grid-list-md fluid>
    <div class="hello">
      <div class="container">
        <div class="row">
          <div class="col-md-8 col-md-offset-2">
            <h2 class="user-info">

              <v-tabs
                color="primary"
                dark
                centered
                slider-color="yellow"
              >
                <v-tab ripple>
                  Public Information
                  <v-icon>lock_open</v-icon>

                </v-tab>
                <v-tab ripple>
                  Private Information
                  <v-icon>lock</v-icon>
                </v-tab>
                <v-tab-item>
                  <v-card flat>
                    <v-form ref="publicForm" v-model="validPublic" lazy-validation>
                      <v-text-field
                        v-model="publicInformation.name"
                        :rules="nameRules"
                        :counter="10"
                        label="Name"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="publicInformation.email"
                        :rules="emailRules"
                        label="E-mail"
                      ></v-text-field>
                      <v-textarea
                        v-model="publicInformation.description"
                        :rules="descriptionRules"
                        :counter="1000"
                        label="Description"
                      ></v-textarea>
                      <v-text-field
                        v-model="publicInformation.bitcoinAddress"
                        :rules="bitcoinAddressRules"
                        :counter="42"
                        label="Bitcoin Address"
                      ></v-text-field>

                      <v-btn
                        :disabled="!validPublic"
                        @click="submitPublic"
                      >
                        submit
                      </v-btn>
                      <v-btn @click="clearPublic">clear</v-btn>
                    </v-form>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card flat>
                    <v-form ref="privateForm" v-model="validPrivate" lazy-validation>
                      <v-text-field
                        v-model="privateInformation.email"
                        :rules="emailRules"
                        label="Private E-mail"
                      ></v-text-field>
                      <v-text-field
                        v-model="privateInformation.phoneNumber"
                        mask="phone"
                        label="Private Phone Number"
                      ></v-text-field>

                      <v-btn
                        :disabled="!validPrivate"
                        @click="submitPrivate"
                      >
                        submit
                      </v-btn>
                      <v-btn @click="clearPrivate">clear</v-btn>
                    </v-form>                  </v-card>
                </v-tab-item>
              </v-tabs>
            </h2>
          </div>
        </div>
      </div>
    </div>
    </v-container>
  </v-app>
</template>

<script>
const logger = require('heroku-logger')
var PRIVATE_STORAGE_FILE = 'private/privateInformation.json'
var PUBLIC_STORAGE_FILE = 'public/publicInformation.json'

export default {
  name: 'settings',
  props: ['user'],
  data: () => ({
    blockstack: window.blockstack,
    validPublic: false,
    validPrivate: false,
    nameField_Public: '',
    nameRules: [
      v => !!v || 'Name is required',
      v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    emailField_Public: '',
    emailRules: [
      v => (v.length === 0 || /.+@.+/.test(v)) || 'E-mail must be valid'
    ],
    descriptionRules: [
      v => (v == null || v.length <= 1000) || 'Description must be less than 1000 characters'
    ],
    bitcoinAddressRules: [
      v => (v == null || v.length <= 42) || 'Max size of a bitcoin public key is 42 characters'
    ],
    publicInformation: {
      name: '',
      email: '',
      description: '',
      bitcoinAddress: ''
    },
    phoneField_Private: '',
    emailField_Private: '',
    privateInformation: {
      email: '',
      phoneNumber: ''
    }
  }),
  mounted () {
    this.fetchData()
  },
  methods: {
    submitPublic () {
      if (this.$refs.publicForm.validate()) {
        const blockstack = this.blockstack

        // encryption is now enabled by default
        logger.info('Saving public file', { file: PUBLIC_STORAGE_FILE })
        return blockstack.putFile(PUBLIC_STORAGE_FILE, JSON.stringify(this.publicInformation), { encrypt: false })
      }
    },
    clearPublic () {
      this.$refs.publicForm.reset()
    },
    submitPrivate () {
      if (this.$refs.privateForm.validate()) {
        const blockstack = this.blockstack

        // encryption is now enabled by default
        logger.info('Saving private file', { file: PRIVATE_STORAGE_FILE })
        return blockstack.putFile(PRIVATE_STORAGE_FILE, JSON.stringify(this.privateInformation), { encrypt: true })
      }
    },
    clearPrivate () {
      this.$refs.privateForm.reset()
    },

    fetchData () {
      const blockstack = this.blockstack
      // Get Public Info
      blockstack.getFile(PUBLIC_STORAGE_FILE, { decrypt: false }) // decryption is enabled by default
      .then((publicInformationJson) => {
        if (publicInformationJson !== null) {
          var publicInformation = JSON.parse(publicInformationJson || '[]')
          this.publicInformation = publicInformation
        }
      })
      // Get Private Info
      blockstack.getFile(PRIVATE_STORAGE_FILE, { decrypt: true }) // decryption is enabled by default
        .then((privateInformationJson) => {
          if (privateInformationJson !== null) {
            var privateInformation = JSON.parse(privateInformationJson || '[]')
            this.privateInformation = privateInformation
          }
        })
    }
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
