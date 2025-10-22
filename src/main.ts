///////////////////////////
// ПОДКЛЮЧЕНИЕ БИБЛИОТЕК //
///////////////////////////

import './assets/main.css'
import axios from 'axios'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router.ts'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from "element-plus/es/locale/lang/ru"
import "dayjs/locale/ru"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"

axios.defaults.baseURL = 'https://akit-testing.ocooler.com/api/'
const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, { locale })

app.use(createPinia())
app.use(router)

app.mount('#app')
