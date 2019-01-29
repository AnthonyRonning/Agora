import Vue from 'vue'
import Router from 'vue-router'
import Landing from '@/components/Landing'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: require('@/views/HomeView')
    },
    {
      path: '/login',
      name: 'Landing',
      component: Landing
    },
    {
      path: '/settings',
      name: 'Settings',
      component: require('@/views/SettingsView')
    },
    {
      path: '/profile/:id',
      name: 'Profile',
      component: require('@/views/ProfileView')
    },
    {
      path: '/profile/:id/item/:itemId',
      name: 'ViewItem',
      component: require('@/views/ViewItemView')
    },
    {
      path: '/following',
      name: 'Following',
      component: require('@/views/FollowingView')
    },
    {
      path: '/additem',
      name: 'AddItem',
      component: require('@/views/AddItemView')
    },
    {
      path: '/cart',
      name: 'Cart',
      component: require('@/views/CartView')
    },
    {
      path: '/orders',
      name: 'Orders',
      component: require('@/views/OrdersView')
    },
    {
      path: '/storeorders',
      name: 'StoreOrders',
      component: require('@/views/StoreOrdersView')
    },
    {
      path: '/importorder',
      name: 'ImportOrder',
      component: require('@/views/ImportOrderView')
    }
  ]
})

export default router
