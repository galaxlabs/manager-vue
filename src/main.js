import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import './themes/gledger.css'
import './themes/daftra.css'
import './themes/gtdispatch.css'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

// Init theme after mount
const theme = useThemeStore()
theme.init()
