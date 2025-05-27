<template>
  <page-layout :heading="`Room: ${room?.name ? room.name : 'error'}`">
    <div class="room-body-container">
      <button class="back-button" type="button" @click="handleLeaveRoom">◀ Leave</button>
      <div class="chat-container" ref="chatContainerRef">
        <ul class="list">
          <chat-message v-for="message in messages" :key="message.id" :message="message" />
        </ul>
      </div>
      <message-form />
    </div>
  </page-layout>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  computed,
  onBeforeMount,
  nextTick,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Message, RoomDetails } from '../../../common/src'
import { getMessages } from '@/api/messages'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import MessageForm from '@/components/chat/MessageForm.vue'
import PageLayout from '@/components/layout/PageLayout.vue'
import { socket } from '@/main'

export default defineComponent({
  name: 'RoomView',
  components: {
    ChatMessage,
    MessageForm,
    PageLayout,
  },
  setup() {
    const messages = ref<Message[]>([])
    const room = ref<RoomDetails | null>(null)
    const chatContainerRef = ref<HTMLElement | null>(null)
    const store = useAuthStore()
    const route = useRoute()
    const router = useRouter()

    const scrollToBottom = () => {
      nextTick(() => {
        if (chatContainerRef.value) {
          chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
        }
      })
    }

    const roomId = computed(() => route.params.roomId as string)
    const token = computed(() => store.getToken)
    const userId = computed(() => store.user?.id)

    const getRoomDetails = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId.value || ''}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.value || '',
          },
        })
        if (!res.ok) throw new Error(res.statusText)
        room.value = await res.json()
      } catch (err) {
        console.error(err)
        router.push('/')
      }
    }

    const getAllMessages = async () => {
      if (!roomId.value || !token.value) throw new Error('Failed to make call')
      try {
        const fetchedMessages = await getMessages(roomId.value, token.value)
        messages.value = fetchedMessages
      } catch (err) {
        console.error('Failed to get messages', err)
      }
    }

    const handleLeaveRoom = async () => {
      try {
        if (!roomId.value) throw new Error('Room ID missing')

        // Try to remove the user from the room on the server
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/rooms/${roomId.value}/members/${userId.value || ''}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token.value || '',
            },
            method: 'DELETE',
          },
        )

        // Even if the API call fails, we'll still leave the room in the UI
        if (!res.ok) {
          console.warn('Failed to remove user from room on server, but continuing navigation')
        }

        // Always leave the room in the socket connection
        socket.emit('leave room', roomId.value, () => {
          // console.log('Left room:', roomId.value)
        })

        // Always navigate to lobby
        router.push('/lobby')
      } catch (err) {
        console.error('Failed to leave room:', err)
        // Even if there's an error, we should still navigate to the lobby
        router.push('/lobby')
      }
    }
    onMounted(async () => {
      await getRoomDetails()
      socket.emit('join room', roomId.value)
      await getAllMessages()
      scrollToBottom()

      socket.on('chat message', (msg: Message, ack: (response: boolean) => void) => {
        messages.value.push(msg)
        scrollToBottom()
        if (ack) ack(true)
      })
    })

    onUnmounted(() => {
      socket.off('chat message')
    })

    return {
      messages,
      room,
      chatContainerRef,
      handleLeaveRoom,
    }
  },
})
</script>

<style scoped>
.list {
  list-style-type: none;
  padding-left: 0;
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-right: 8px;
  margin-bottom: 10px;
  scroll-behavior: smooth;
}

.room-body-container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  justify-content: space-between;
  height: calc(100vh - 120px);
  width: 100%;
  max-width: 690px; /* Keep the max-width but set width to 100% */
  margin: 0 auto; /* Center horizontally */
}

.back-button {
  background: linear-gradient(135deg, #5575cc, #3f5288);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  cursor: pointer;
  border-radius: 8px;
  align-self: flex-start;
  margin-bottom: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 6px rgba(63, 82, 136, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(63, 82, 136, 0.4);
}

.back-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(63, 82, 136, 0.3);
}
</style>
