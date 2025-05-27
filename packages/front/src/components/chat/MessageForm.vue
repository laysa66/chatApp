<template>
  <div>
    <form @submit.prevent="handleSubmit" class="message-form">
      <label for="message" hidden>Write message</label>
      <div class="message-form-container">
        <input
          type="text"
          id="message"
          v-model="content"
          autocomplete="off"
          class="message-input"
          placeholder="Type your message..."
        />
        <button type="submit" class="send-button">
          <span class="send-icon">Send</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
export default defineComponent({
  name: 'MessageForm',
  setup() {
    const content = ref('')
    const store = useAuthStore()
    const route = useRoute()
    const roomId = computed(() => route.params.roomId as string)
    const userId = computed(() => store.user?.id)
    const token = computed(() => store.getToken)

    const handleSubmit = async () => {

      if (!content.value || content.value.trim() === '' || !userId.value || !token.value) return
      try {
        const body = JSON.stringify({
          content: content.value,
          userId: userId.value,
          roomId: roomId.value,
        })

        await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.value,
          },
          body,
        })

        content.value = ''
      } catch (err) {
        console.error('Error sending message:', err)
      }
    }

    return {
      content,
      handleSubmit,
    }
  },
})
</script>

<style scoped>
.message-form {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(to right, #f9fafc, #f0f4f9);
  border-radius: 16px;
  box-shadow:
    0 -2px 15px rgba(0, 0, 0, 0.05),
    0 2px 5px rgba(255, 255, 255, 0.7) inset;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  position: relative;
  margin-top: 10px;
}

.message-form:focus-within {
  transform: translateY(-2px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.08),
    0 2px 5px rgba(255, 255, 255, 0.7) inset;
}

.message-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.message-form-container {
  display: flex;
  width: 100%;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background-color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.05),
    0 0 0 2px transparent;
}

.message-input:focus {
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 2px rgba(99, 132, 219, 0.3);
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #486fe8, #345ac2);
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 3px 8px rgba(52, 90, 194, 0.3);
  position: relative;
  overflow: hidden;
  font-weight: 600;
  font-size: 0.9rem;
}

.send-button:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #3e62d8, #2c4da7);
  box-shadow: 0 6px 12px rgba(52, 90, 194, 0.4);
}

.send-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(52, 90, 194, 0.3);
}

.send-button::after {
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

.send-button:focus::after {
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

.send-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
  letter-spacing: 0.5px;
}

.send-button:hover .send-icon {
  transform: translateX(2px);
}

.message-input::placeholder {
  color: #8a9ab0;
  transition: opacity 0.3s ease;
}

.message-input:focus::placeholder {
  opacity: 0.5;
}
</style>
