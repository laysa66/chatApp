<template>
  <div class="body-outer">
    <div class="body-inner">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BodyContainer'
});
</script>

<style scoped>
.body-outer {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;
}

.body-inner {
  display: flex;
  padding: 0 1rem;
}
</style>