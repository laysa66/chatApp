<template>
  <div class="nav-bar-container">
    <div class="nav-bar-items">
      <h1>{{ heading }}</h1>
      <div class="button-group">
        <template v-if="user">
          <router-link to="/lobby" class="nav-link">Lobby</router-link>
          <router-link v-if="isAdmin" to="/admin" class="admin-link">Admin Dashboard</router-link>
          <router-link v-if="isAdmin" to="/admin/users" class="admin-link">Users</router-link>
          <router-link v-if="isAdmin" to="/admin/rooms" class="admin-link">Rooms Admin</router-link>
          <p class="logged-in-user-detail">
            Logged in as <strong>{{ user.email }}</strong>
          </p>
          <button class="auth-button" @click="onLogout">Logout</button>
        </template>
        <template v-else>
          <button class="auth-button" @click="navigateTo('/login')">Login</button>
          <button class="auth-button" @click="navigateTo('/register')">Register</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'NavBar',
  props: {
    heading: {
      type: String,
      required: true,
    },
  },
  setup() {
    const router = useRouter()
    const auth = useAuthStore()

    const user = computed(() => auth.user)
    const isAdmin = computed(() => auth.isAdmin)

    const navigateTo = (path: string) => {
      router.push(path)
    }

    const onLogout = async () => {
      auth.logout()
      navigateTo('/login')
    }

    return {
      user,
      isAdmin,
      navigateTo,
      onLogout,
    }
  },
})
</script>

<style scoped>
.nav-bar-container {
  background: linear-gradient(135deg, #5575cc, #3f5288);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.13),
    0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 0.7rem 1.2rem;
  position: relative;
  z-index: 100;
}

.nav-bar-container::before {
  content: '';
  position: absolute;
  top: -120%;
  left: -40%;
  width: 180%;
  height: 260%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0.08) 100%
  );
  filter: blur(8px);
  pointer-events: none;
  z-index: 1;
  animation: shimmerEffect 8s infinite linear;
}

@keyframes shimmerEffect {
  0% {
    transform: translateX(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) rotate(30deg);
  }
}

.nav-bar-items {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  width: 100%;
  margin: auto;
  position: relative;
  z-index: 2;
}

h1 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 1px;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.13);
  position: relative;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  padding: 0.2rem 0.7rem;
}

h1:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.04) translateY(-1px);
}

.button-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link,
.admin-link {
  color: #fff;
  text-decoration: none;
  padding: 0.45rem 1.1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.80rem;
  background: rgba(255, 255, 255, 0.07);
  margin-right: 2px;
  transition:
    background 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: none;
  outline: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.nav-link::after,
.admin-link::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 7px;
  width: 0;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition:
    width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover,
.admin-link:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px) scale(1.06);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.13);
}

.nav-link:hover::after,
.admin-link:hover::after {
  width: 60%;
  left: 20%;
}

.admin-link {
  background: linear-gradient(90deg, #e74c3c 60%, #c0392b 100%);
  color: #fff;
  font-weight: 700;
  margin-right: 0;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.09);
}

.admin-link:hover {
  background: linear-gradient(90deg, #ff6b5a 60%, #e74c3c 100%);
}

.auth-button {
  background: rgba(255, 255, 255, 0.13);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.45rem 1.1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.80rem;
  cursor: pointer;
  transition:
    background 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  position: relative;
  overflow: hidden;
  outline: none;
}

.auth-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0));
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 0;
}

.auth-button:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-2px) scale(1.06);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.13);
}

.auth-button:hover::before {
  transform: translateY(0);
}

.auth-button:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.13);
}

.logged-in-user-detail {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.93);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.38rem 0.9rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  animation: fadeIn 0.6s ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  margin-left: 8px;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.logged-in-user-detail strong {
  color: #fff;
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.13);
}

@media (max-width: 900px) {
  .nav-bar-items {
    flex-direction: column;
    gap: 14px;
    text-align: center;
  }
  .button-group {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  h1 {
    margin-bottom: 8px;
  }
}

@media (max-width: 600px) {
  .nav-bar-container {
    padding: 0.5rem 0.3rem;
    border-radius: 0 0 12px 12px;
  }
  .nav-bar-items {
    max-width: 100%;
    padding: 0;
  }
  .button-group {
    gap: 4px;
  }
  .nav-link,
  .admin-link,
  .auth-button {
    font-size: 0.86rem;
    padding: 0.38rem 0.7rem;
  }
  .logged-in-user-detail {
    font-size: 0.80rem;
    padding: 0.3rem 0.5rem;
  }
}
</style>
