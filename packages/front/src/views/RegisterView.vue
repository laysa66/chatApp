<template>
  <page-layout heading="Register">
    <register-form />
  </page-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageLayout from '../components/layout/PageLayout.vue';
import RegisterForm from '../components/auth/RegisterForm.vue';

export default defineComponent({
  name: 'RegisterView',
  components: {
    PageLayout,
    RegisterForm
  }
});
</script>