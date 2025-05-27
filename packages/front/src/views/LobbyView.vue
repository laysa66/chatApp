<template>
  <page-layout heading="Lobby">
    <lobby />
  </page-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageLayout from '../components/layout/PageLayout.vue';
import Lobby from '../components/lobby/Lobby.vue';

export default defineComponent({
  name: 'LobbyView',
  components: {
    PageLayout,
    Lobby
  }
});
</script>