import Vue from 'vue'
import VueRouter from 'vue-router'
import bpmn1 from '../views/bpmn1.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'bpmn1',
    component: bpmn1
  }
]

const router = new VueRouter({
  routes
})

export default router
