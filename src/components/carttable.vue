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
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn :disabled="isEmpty" slot="activator" color="primary" dark class="mb-2">Pay now: ${{ totalPrice }}</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
<!--
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.name" label="Item name"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.price" label="Price"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.quantity" label="Quantity"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
          </v-card-actions>-->
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="desserts"
      class="elevation-1"
      hide-actions
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">{{ props.item.price }}</td>
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
    props: ['vendorName', 'desserts'],
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
      desserts: [],
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
        return this.desserts.length === 0
      },
      totalPrice: function () {
        // `this` points to the vm instance
        return this.desserts
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
        const index = this.desserts.indexOf(item)
        confirm('Are you sure you want to delete this item?') && this.desserts.splice(index, 1)
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
          Object.assign(this.desserts[this.editedIndex], this.editedItem)
        } else {
          this.desserts.push(this.editedItem)
        }
        this.close()
      }
    }
  }
</script>

<style scoped>

</style>
