import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/index.vue'
import Palette from '@/views/palette.vue'
import NotFound from '@/views/notfound.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/palette',
      name: 'Palette',
      component: Palette
    },
    {
      path: '*',
      name: 'notFound',
      component: NotFound
    }
  ]
})
