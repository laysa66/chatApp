<template>
  <page-layout heading="Home">
    <p>Welcome to this WebSockets project</p>
  </page-layout>
</template>

<script setup lang="ts">
import PageLayout from '../components/layout/PageLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
const store = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (store.user) {
    router.push('/lobby')
  } else {
    router.push('/login')
  }

  watch(
    () => store.user,
    (newUser) => {
      if (newUser) {
        router.push('/lobby')
      } else {
        router.push('/login')
      }
    },
  )
})
</script>
