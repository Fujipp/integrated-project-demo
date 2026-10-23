import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/AuthUserStore'

async function bootstrap() {
  const pinia = createPinia()
  const app = createApp(App)
  app.use(pinia)
  // Restore the demo identity before guards and ownership checks run on reload.
  await useUserStore(pinia).initializeStore()
  app.use(router)
  app.mount('#app')
}
bootstrap()
