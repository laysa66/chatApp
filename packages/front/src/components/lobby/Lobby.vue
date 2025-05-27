<template>
  <div class="lobby-container">
    <h3>Welcome to the Lobby!</h3>
    <lobby-form />
    <room-list />
  </div>
</template>

<script setup lang="ts">
import RoomList from './RoomList.vue'
import LobbyForm from './LobbyForm.vue'
</script>

<style scoped>
.lobby-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 690px;
  padding-top: 20px;
  gap: 2rem;
  margin: 0 auto; /* Add this line to center the container */
}

h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #3f5288;
  text-align: center;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #6384db, #4a6cb3);
  transform: translateX(-50%);
  border-radius: 3px;
}
</style>
