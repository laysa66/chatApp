<template>
  <div class="page-container">
    <nav-bar :heading="heading" />
    <div class="body-outer">
      <div class="body-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from './NavBar.vue'

defineProps({
  heading: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  background: #f0f4f9;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.body-outer {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Added to center content vertically */
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.body-inner {
  display: flex;
  flex-direction: column; /* Change to column for better centering */
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
  padding: 0 1rem;
  width: 100%;
  max-width: 1200px;
}
</style>
