<template>
  <div :class="['message-container', isMine ? 'self' : 'other']">
    <div class="message-bubble" :class="isMine ? 'self' : 'other'">
      <div class="message-info">
        <span class="message-sender">{{ message.user.name }}</span>
        <!-- <span class="message-time">{{ message.timestamp }}</span>F -->
      </div>
      <p class="message-content">{{ message.content }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Message } from '../../../../common/src'

export default defineComponent({
  name: 'ChatMessage',
  props: {
    message: {
      type: Object as () => Message,
      required: true,
    },
  },
  setup(props) {
    const store = useAuthStore()

    const isMine = computed(() => store.user?.id === props.message.user.id)

    return {
      isMine,
    }
  },
})
</script>

<style scoped>
.message-container {
  margin: 10px 0; /* Reduced margin from 16px to 10px */
  position: relative;
  max-width: 65%; /* Reduced max-width from 75% to 65% */
  animation: messageAppear 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes messageAppear {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble {
  padding: 8px 12px; /* Reduced padding from 12px 16px to 8px 12px */
  border-radius: 14px; /* Reduced border-radius from 18px to 14px */
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); /* Lighter shadow */
  transition: all 0.3s ease;
  overflow: hidden;
}

.message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.message-bubble.self {
  background: linear-gradient(135deg, #486fe8, #345ac2);
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.message-bubble.other {
  background: linear-gradient(135deg, #e0e5ee, #d1d8e6);
  color: #2a3a56;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.message-content {
  word-break: break-word;
  line-height: 1.4; /* Slightly reduced line height */
  position: relative;
  z-index: 2;
  font-weight: 400;
  font-size: 0.95rem; /* Added smaller font size */
  margin: 0; /* Remove default paragraph margin */
}

.message-info {
  display: flex;
  align-items: center;
  margin-bottom: 2px; /* Reduced margin from 4px to 2px */
  font-size: 0.8rem; /* Reduced font size from 0.85rem to 0.8rem */
}

.message-sender {
  font-weight: 700;
  margin-right: 6px; /* Reduced margin from 8px to 6px */
}

.message-bubble.self .message-sender {
  color: rgba(255, 255, 255, 0.95);
}

.message-bubble.other .message-sender {
  color: #345ac2;
}

.message-time {
  opacity: 0.7;
  font-size: 0.7rem; /* Reduced font size from 0.75rem to 0.7rem */
}

.message-bubble.self .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 0;
  background: rgba(255, 255, 255, 0.1);
  transition: height 0.3s ease;
}

.message-bubble:hover::after {
  height: 100%;
}

.message-bubble.self::before {
  content: '';
  position: absolute;
  bottom: 0;
  right: -8px;
  width: 12px; /* Reduced size from 16px to 12px */
  height: 12px; /* Reduced size from 16px to 12px */
  background: #345ac2;
  border-radius: 3px;
  transform: rotate(45deg);
  z-index: -1;
}

.message-bubble.other::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 12px; /* Reduced size from 16px to 12px */
  height: 12px; /* Reduced size from 16px to 12px */
  background: #d1d8e6;
  border-radius: 3px;
  transform: rotate(45deg);
  z-index: -1;
}

.message-container.self {
  animation: appearFromRight 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.message-container.other {
  animation: appearFromLeft 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes appearFromRight {
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes appearFromLeft {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
