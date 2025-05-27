<template>
  <div class="room-list">
    <h2 class="room-list-title">Available Rooms</h2>
    <p v-if="rooms.length === 0" class="no-rooms">
      There are no rooms right now, try creating one.
    </p>
    <div v-for="room in rooms" :key="room.id" class="room-item" @click="handleJoinRoom(room.id)">
      <span class="room-name">{{ room.name }}</span>
      <div class="room-info">
        <span class="room-count">Members: {{ room.memberCount }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { EventResponse, RoomDetailsWithMemberCount } from '../../../../common/src'
import { socket } from '@/main'

export default defineComponent({
  name: 'RoomList',
  setup() {
    const rooms = ref<RoomDetailsWithMemberCount[]>([])
    const router = useRouter()
    const store = useAuthStore()

    const token = computed(() => store.getToken)
    const userId = computed(() => store.user?.id)

    const getAllRooms = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
          headers: { Authorization: token.value || '' },
        })

        if (!res.ok) throw new Error(res.statusText)
        rooms.value = await res.json()
      } catch (e) {
        console.error(e)
      }
    }

    const handleJoinRoom = async (roomId: string) => {
      try {
        if (!token.value) throw new Error('Not logged in')

        const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId}/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.value,
          },
          body: JSON.stringify({ id: userId.value }),
        })

        if (!res.ok) throw new Error(res.statusText)

        socket.emit('join room', roomId)
        router.push(`/lobby/room/${roomId}`)
      } catch (error) {
        console.error('Error joining room:', error)
      }
    }

    onMounted(async () => {
      await getAllRooms()
    })

    return {
      rooms,
      handleJoinRoom,
    }
  },
})
</script>

<style scoped>
.room-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 0;
}

.room-list-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
  position: relative;
  display: inline-block;
}

.room-list-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #6384db, #4a6cb3);
  transform: translateX(-50%);
  border-radius: 3px;
}

.room-item {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(145deg, #f8faff, #f0f4f9);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  animation: slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  animation-fill-mode: both;
}

.room-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, #6384db, #4a6cb3);
  transform: scaleY(0);
  transition: transform 0.3s ease;
  transform-origin: bottom;
}

.room-item:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.08),
    0 2px 5px rgba(0, 0, 0, 0.05);
}

.room-item:hover::before {
  transform: scaleY(1);
}

.room-item:active {
  transform: translateY(0);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.03);
}

.room-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.05rem;
  transition:
    transform 0.3s ease,
    color 0.3s ease;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606f7b;
  font-size: 0.9rem;
}

.room-count {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(99, 132, 219, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  color: #4a6cb3;
  transition: all 0.3s ease;
}

.room-item:hover .room-name {
  transform: translateX(8px);
  color: #4a6cb3;
}

.room-item:hover .room-count {
  background: rgba(99, 132, 219, 0.2);
}

.no-rooms {
  text-align: center;
  margin: 2rem 0;
  color: #606f7b;
  font-style: italic;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.room-list > .room-item:nth-child(2) {
  animation-delay: 0.1s;
}

.room-list > .room-item:nth-child(3) {
  animation-delay: 0.2s;
}

.room-list > .room-item:nth-child(4) {
  animation-delay: 0.3s;
}

.room-list > .room-item:nth-child(n + 5) {
  animation-delay: 0.4s;
}
</style>
