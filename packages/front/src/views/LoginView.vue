<template>
  <page-layout heading="Login">
    <login-form />
  </page-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import PageLayout from '../components/layout/PageLayout.vue'
import LoginForm from '../components/auth/LoginForm.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  if (auth.user) {
    router.push('/lobby')
  }
})
</script>
