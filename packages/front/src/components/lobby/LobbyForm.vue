<template>
  <div class="form-container">
    <h1 class="form-title">Create a Room</h1>
    <form @submit.prevent="handleCreateRoom">
      <label for="name">Room name</label>
      <input id="name" v-model="roomName" placeholder="Enter a room name" type="text" required />
      <span v-if="roomNameError" class="error">{{ roomNameError }}</span>
      <button type="submit">Create Room</button>
    </form>
    <div class="form-footer">Fill in the details to create a new room</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
//import { io, Socket } from 'socket.io-client';
//import { io, Socket } from 'socket.io-client';
import type { RoomDetails } from '../../../../common/src'
import { socket } from '../../main'

export default defineComponent({
  name: 'LobbyForm',
  setup() {
    const roomName = ref('')
    const roomNameError = ref('')
    const router = useRouter()
    const store = useAuthStore()

    const token = computed(() => store.getToken)
    const userId = computed(() => store.user?.id)

    const handleCreateRoom = async () => {
      try {
        if (!token.value) throw new Error('Not logged in')

        const res = await fetch(`${import.meta.env.VITE_API_URL}/room`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.value,
          },
          body: JSON.stringify({
            name: roomName.value,
            owner: userId.value,
          }),
        })

        if (!res.ok) throw new Error(res.statusText)
        const response = (await res.json()) as RoomDetails

        socket.emit('join room', response.id)
        router.push(`/lobby/room/${response.id}`)
      } catch (error) {
        console.error('Error submitting form:', error)
        roomNameError.value = 'Failed to create room'
      }
    }

    return {
      roomName,
      roomNameError,
      handleCreateRoom,
    }
  },
})
</script>

<style scoped>
.form-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(145deg, #f8faff, #eef2f9);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 1px 8px rgba(0, 0, 0, 0.05),
    0 20px 30px rgba(76, 103, 170, 0.08);
  position: relative;
  overflow: hidden;
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
}

.form-container::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(255, 255, 255, 0.8) 50%,
    transparent 60%
  );
  transform: rotate(30deg);
  animation: shinyEffect 8s infinite linear;
  pointer-events: none;
  z-index: 1;
}

.form-container:hover {
  transform: translateY(-5px);
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.06),
    0 25px 40px rgba(76, 103, 170, 0.12);
}

@keyframes shinyEffect {
  0% {
    transform: translateX(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) rotate(30deg);
  }
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  display: inline-block;
}

.form-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #6384db, #4a6cb3);
  border-radius: 3px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 2;
}

label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
  display: block;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

input {
  padding: 0.9rem 1rem;
  border: 2px solid transparent;
  border-radius: 10px;
  outline: none;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
  font-size: 1rem;

  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
}

input:focus {
  border-color: #6384db;
  box-shadow:
    0 0 0 4px rgba(99, 132, 219, 0.15),
    inset 0 2px 4px rgba(0, 0, 0, 0.04);
  transform: scale(1.01);
}

button {
  padding: 0.9rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6384db, #4a6cb3);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 10px rgba(74, 108, 179, 0.25);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  margin-top: 10px;
}

button:hover {
  background: linear-gradient(135deg, #5575cc, #3f5288);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(74, 108, 179, 0.35);
}

button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(74, 108, 179, 0.25);
}

button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

button:focus::after {
  animation: buttonRipple 0.8s ease-out;
}

@keyframes buttonRipple {
  0% {
    transform: scale(0) translate(-50%, -50%);
    opacity: 0.6;
  }
  100% {
    transform: scale(15) translate(-50%, -50%);
    opacity: 0;
  }
}

.form-footer {
  text-align: center;
  margin-top: 10px;
  color: #606f7b;
  font-size: 0.9rem;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 6px;
  animation: errorShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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
