<template>
  <PageLayout heading="Room Management">
    <div class="admin-rooms">
      <h1>Room Management</h1>

      <div class="admin-nav">
        <router-link to="/admin" class="nav-link">Dashboard</router-link>
        <router-link to="/admin/users" class="nav-link">Users</router-link>
        <router-link to="/admin/rooms" class="nav-link">Rooms</router-link>
        <router-link to="/lobby" class="nav-link user-feature">Chat Lobby</router-link>
      </div>

      <div class="rooms-container">
        <div v-if="loading" class="loading">Loading rooms...</div>

        <div v-else-if="rooms.length === 0" class="no-rooms">No rooms found</div>

        <div v-else>
          <table class="rooms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Members</th>
                <th>Messages</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in rooms" :key="room.id">
                <td>{{ room.name }}</td>
                <td>{{ findUserName(room.owner) }}</td>
                <td>{{ room.memberCount }}</td>
                <td>{{ room.messageCount || 0 }}</td>
                <td>
                  <div class="actions">
                    <router-link :to="`/lobby/room/${room.id}`" class="view-btn">
                      View
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import { getAllRooms } from '../../api/rooms'
import { getUsers } from '../../api/admin/adminService'

interface UserDetails {
  id: string
  name: string
  email: string
  role: string
}

interface RoomDetails {
  id: string
  name: string
  owner: string
  memberCount: number
  messageCount?: number
}

export default defineComponent({
  name: 'AdminRoomsView',

  components: {
    PageLayout,
  },

  setup() {
    const rooms = ref<RoomDetails[]>([])
    const users = ref<UserDetails[]>([])
    const loading = ref(true)

    const fetchRooms = async () => {
      try {
        loading.value = true
        const data = await getAllRooms()
        rooms.value = data
        loading.value = false
      } catch (error) {
        console.error('Failed to fetch rooms:', error)
        loading.value = false
      }
    }

    const fetchUsers = async () => {
      try {
        const data = await getUsers()
        users.value = data as unknown as UserDetails[]
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }

    const findUserName = (userId: string): string => {
      const user = users.value.find((u) => u.id === userId)
      return user ? user.name : 'Unknown User'
    }

    onMounted(async () => {
      await Promise.all([fetchRooms(), fetchUsers()])
    })

    return {
      rooms,
      loading,
      findUserName,
    }
  },
})
</script>

<style scoped>
.admin-rooms {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.admin-nav {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.nav-link {
  padding: 8px 15px;
  margin-right: 10px;
  text-decoration: none;
  color: #2c3e50;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.router-link-active {
  background-color: #42b983;
  color: white;
}

.rooms-container {
  margin-top: 20px;
}

.loading,
.no-rooms {
  text-align: center;
  padding: 40px;
  color: #666;
}

.rooms-table {
  width: 100%;
  border-collapse: collapse;
}

.rooms-table th,
.rooms-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.rooms-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 8px;
}

.view-btn {
  display: inline-block;
  padding: 6px 12px;
  background-color: #17a2b8;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.85rem;
  transition: background-color 0.3s;
}

.view-btn:hover {
  background-color: #138496;
}
</style>
