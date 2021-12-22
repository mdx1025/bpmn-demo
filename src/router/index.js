import Vue from 'vue'
import VueRouter from 'vue-router'
import bpmn from '../views/bpmn.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'bpmn',
    component: bpmn
  }
]

const router = new VueRouter({
  routes
})

export default router
