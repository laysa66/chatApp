<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: #171a21;
}

.debug-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  font-size: 12px;
  z-index: 9999;
  max-width: 300px;
  border-top-left-radius: 8px;
}

.debug-panel h3 {
  margin-top: 0;
  margin-bottom: 5px;
}

.debug-panel p {
  margin: 5px 0;
}

.debug-panel button {
  background: #42b983;
  border: none;
  color: white;
  padding: 5px 10px;
  margin-top: 5px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
