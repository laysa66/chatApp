<template>
  <div class="nav-bar-container">
    <div class="nav-bar-items">
      <h1>{{ heading }}</h1>
      <div class="button-group">
        <template v-if="user">
          <router-link v-if="isAdmin" to="/admin" class="admin-link">Admin Dashboard</router-link>
          <p class="logged-in-user-detail">
            Logged in as <strong>{{ user.email }}</strong>
          </p>
          <button class="auth-button" @click="onLogout">Logout</button>
        </template>
        <template v-else>
          <button class="auth-button" @click="navigateTo('/login')">Login</button>
          <button class="auth-button" @click="navigateTo('/register')">Register</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{ heading: string }>()

const router = useRouter()
const auth = useAuthStore()

const user = computed(() => auth.user)
const isAdmin = computed(() => auth.isAdmin)

function navigateTo(path: string) {
  router.push(path)
}

async function onLogout() {
  await auth.logout()
  navigateTo('/login')
}
</script>

<style scoped>
/* ...existing styles... */
</style>
