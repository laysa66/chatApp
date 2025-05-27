import './assets/main.css'
import 'normalize.css'

import { createApp, toRaw } from 'vue'
import { createPinia } from 'pinia'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import Cookies from 'js-cookie'
const app = createApp(App)

const socket: Socket = io(`${import.meta.env.VITE_API_URL}`, {
  ackTimeout: 1000,
  retries: 3,
})

app.use(createPinia())
app.use(router)

// WebSocket authentication logic
const auth = useAuthStore()

socket.on('connect', () => {
  if (auth.user && auth.user.id) {
    socket.emit('authenticate', toRaw(auth.user).id)
  }
})

const token = Cookies.get('site')

if (token !== null && token !== undefined && token !== '' && token !== 'undefined') {
  auth
    .loginWithToken(token)
    .then(() => {
      if (auth.user && auth.user.id) {
        socket.emit('authenticate', toRaw(auth.user).id)
      }
    })
    .catch((error) => {
      console.error('Failed to login with token:', error)
    })
    .finally(() => {
      app.mount('#app')
    })
} else {
  app.mount('#app')
}

// Optionally export socket for use in components
export { socket }
