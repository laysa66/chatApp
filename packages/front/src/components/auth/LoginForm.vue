<template>
  <form class="form-container" @submit.prevent="onSubmit">
    <label for="email">Email</label>
    <input
      id="email"
      v-model="email"
      type="email"
      required
      autocomplete="username"
      pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
      title="Please enter a valid email address"
    />
    <label for="password">Password</label>
    <input
      id="password"
      v-model="password"
      type="password"
      required
      autocomplete="current-password"
    />
    <span v-if="emailError">{{ emailError }}</span>
    <span v-if="passwordError">{{ passwordError }}</span>
    <input type="submit" value="Login" />
  </form>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserDetails } from '../../../../common/src'

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const router = useRouter()
const auth = useAuthStore()
const response: Ref<UserDetails & { token: string }> = ref({} as UserDetails & { token: string })

const onSubmit = async () => {
  emailError.value = ''
  passwordError.value = ''

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })
    if (!res.ok) throw new Error(res.statusText)

    response.value = await res.json()

    auth.login(response.value)
    router.push({ name: 'Lobby' })
  } catch (error) {
    console.error('Error submitting form:', error)
    passwordError.value = 'Login failed. Please check your credentials.'
  }
}
</script>
<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 380px;
  margin: 3rem auto;
  padding: 2.5rem;
  border-radius: 16px;
  background: linear-gradient(145deg, #f3f8ff, #eaf0f9);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 1px 8px rgba(0, 0, 0, 0.07),
    0 20px 30px rgba(76, 103, 170, 0.1);
  position: relative;
  overflow: hidden;
  animation: appearIn 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
}

.form-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(255, 255, 255, 0.8) 50%,
    transparent 60%
  );
  transform: rotate(30deg);
  animation: shinyEffect 6s infinite linear;
  pointer-events: none;
  z-index: 1;
}

.form-container:hover {
  transform: translateY(-5px);
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.12),
    0 5px 15px rgba(0, 0, 0, 0.08),
    0 25px 40px rgba(76, 103, 170, 0.15);
}

@keyframes appearIn {
  0% {
    opacity: 0;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shinyEffect {
  0% {
    transform: translateX(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) rotate(30deg);
  }
}

input {
  padding: 0.8rem 1rem;
  border: 2px solid transparent;
  border-radius: 10px;
  outline: none;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  z-index: 2;
}

input:focus {
  border-color: #5a78c7;
  box-shadow:
    0 0 0 4px rgba(90, 120, 199, 0.2),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
  transform: scale(1.02);
}

input[type='submit'] {
  background: linear-gradient(135deg, #5575cc, #3f5288);
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 8px;
  box-shadow: 0 6px 12px rgba(63, 82, 136, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

input[type='submit']:hover {
  background: linear-gradient(135deg, #4967bd, #2d3b61);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 16px rgba(63, 82, 136, 0.4);
}

input[type='submit']:active {
  transform: translateY(1px);
  box-shadow: 0 4px 8px rgba(63, 82, 136, 0.3);
}

input[type='submit']::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

input[type='submit']:focus::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0) translate(-50%, -50%);
    opacity: 0.6;
  }
  100% {
    transform: scale(20) translate(-50%, -50%);
    opacity: 0;
  }
}

label {
  font-weight: 600;
  color: #2c3e50;
  margin-left: 0.2rem;
  font-size: 0.95rem;
  transform: translateY(0);
  transition:
    transform 0.3s,
    color 0.3s;
  position: relative;
}

label::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #5575cc, #3f5288);
  transition: width 0.3s ease;
}

.form-container:hover label::after {
  width: 30px;
}

span {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: -6px;
  animation: errorShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform-origin: center bottom;
}

@keyframes errorShake {
  10%,
  90% {
    transform: translateX(-1px);
  }
  20%,
  80% {
    transform: translateX(2px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-3px);
  }
  40%,
  60% {
    transform: translateX(3px);
  }
}
</style>
