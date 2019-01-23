<template>
  <div>
    <v-toolbar flat color="white">
      <v-toolbar-title>{{ vendorName }}</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="isEmpty"
        color="primary"
        dark
        class="mb-2"
        @click="createOrder">Order now: ${{ totalPrice }}
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="cart.itemList"
      class="elevation-1"
      hide-actions
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">${{ props.item.price }}</td>
        <td class="text-xs-right">{{ props.item.quantity }}</td>
        <td class="right layout px-3">
          <v-icon
            small
            @click="deleteItem(props.item)"
          >
            delete
          </v-icon>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  export default {
    Name: 'carttable',
    props: ['vendorName', 'cart'],
    data: () => ({
      dialog: false,
      headers: [
        {
          text: 'Item name',
          align: 'left',
          value: 'name'
        },
        { text: 'Price', value: 'price', align: 'right' },
        { text: 'Quantity', value: 'quantity', align: 'right' },
        { text: 'Actions', value: 'name', align: 'right', sortable: false }
      ],
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
      }
    }),

    computed: {
      isEmpty () {
        return this.cart.itemList.length === 0
      },
      totalPrice: function () {
        // `this` points to the vm instance
        return this.cart.itemList
          .map(v => v.price)
          .reduce((sum, current) => sum + current, 0)
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
      },

      deleteItem (item) {
        const index = this.cart.itemList.indexOf(item)

        confirm('Are you sure you want to delete this item?') &&
        this.cart.itemList.splice(index, 1) &&
        this.$emit('updateCart', this.cart)
      },

      createOrder () {
        this.$emit('createOrder', this.cart)
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
          Object.assign(this.cart.itemList[this.editedIndex], this.editedItem)
        } else {
          this.cart.itemList.push(this.editedItem)
        }
        this.close()
      }
    }
  }
</script>

<style scoped>

</style>
