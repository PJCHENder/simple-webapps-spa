import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/index.vue'
import Palette from '@/views/palette.vue'
import MindfulTimer from '@/views/mindful_timer.vue'
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
      path: '/mindful-timer',
      name: 'MindfulTimer',
      component: MindfulTimer
    },
    {
      path: '*',
      name: 'notFound',
      component: NotFound
    }
  ]
})
