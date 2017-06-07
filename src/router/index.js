import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/views/Hello.vue'
import Palette from '@/views/palette.vue'
import NotFound from '@/views/notfound.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
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
