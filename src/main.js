import Vue from 'vue'
import App from './App.vue'
import router from './router'

// bpmn 相关依赖
import 'bpmn-js/dist/assets/diagram-js.css' 
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

// 左边工具栏以及编辑节点的样式
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './style/custom/index.css'
Vue.use(ElementUI);

import { vuePlugin } from "@/highlight";
import "highlight.js/styles/atom-one-dark-reasonable.css";
Vue.use(vuePlugin);

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
