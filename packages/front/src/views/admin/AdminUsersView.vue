<template>
  <PageLayout heading="User Management">
    <div class="admin-users">
      <h1>User Management</h1>

      <div class="admin-nav">
        <router-link to="/admin" class="nav-link">Dashboard</router-link>
        <router-link to="/admin/users" class="nav-link">Users</router-link>
        <router-link to="/admin/rooms" class="nav-link">Rooms</router-link>
        <router-link to="/lobby" class="nav-link user-feature">Chat Lobby</router-link>
      </div>

      <div class="users-container">
        <div v-if="loading" class="loading">Loading users...</div>

        <div v-else-if="users.length === 0" class="no-users">No users found</div>

        <div v-else>
          <div class="actions-bar">
            <button @click="showCreateUserModal = true" class="create-user-btn">
              Create New User
            </button>
          </div>

          <table class="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', user.roles[0].name]">{{ user.roles[0].name }}</span>
                </td>
                <td>
                  <div class="actions">
                    <button
                      v-if="user.roles[0].name === 'user'"
                      @click="promoteUser(user.id)"
                      class="promote-btn"
                      :disabled="isProcessing"
                    >
                      Make Admin
                    </button>
                    <button
                      v-else
                      @click="demoteUser(user.id)"
                      class="demote-btn"
                      :disabled="isProcessing || user.id === currentUserId"
                    >
                      Make User
                    </button>
                    <button
                      @click="confirmDeleteUser(user)"
                      class="delete-btn"
                      :disabled="isProcessing || user.id === currentUserId"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create User Modal -->
      <div v-if="showCreateUserModal" class="modal">
        <div class="modal-content">
          <h3>Create New User</h3>
          <form @submit.prevent="createUser">
            <div class="form-group">
              <label for="name">Name</label>
              <input
                type="text"
                id="name"
                v-model="newUser.name"
                required
                placeholder="Enter name"
              />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                autocomplete="email"
                v-model="newUser.email"
                required
                placeholder="Enter email"
              />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                autocomplete="current-password"
                v-model="newUser.password"
                required
                placeholder="Enter password"
              />
            </div>
            <div class="form-group">
              <label for="role">Role</label>
              <select id="role" v-model="roleSelectedId">
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>
            <div class="modal-buttons">
              <button type="button" @click="showCreateUserModal = false" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="submit-btn" :disabled="isProcessing">Create User</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-content confirmation">
          <h3>Confirm Delete</h3>
          <p>
            Are you sure you want to delete user <strong>{{ userToDelete?.name }}</strong
            >?
          </p>
          <p class="warning">
            This action cannot be undone and will delete all user data including messages and rooms.
          </p>
          <div class="modal-buttons">
            <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
            <button @click="deleteUser" class="delete-btn-confirm" :disabled="isProcessing">
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageLayout from '@/components/layout/PageLayout.vue'
import {
  getUsers,
  deleteUser as apiDeleteUser,
  updateUserRole,
  getRoles,
  promoteAdmin,
  demoteAdmin,
} from '@/api/admin/adminService'
import { createUser as apiCreateUser } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import type { Role, UserDetails } from '../../../../common/src'

const store = useAuthStore()

const users = ref<UserDetails[]>([])
const roles = ref<Role[]>([])
const loading = ref(true)
const isProcessing = ref(false)
const showCreateUserModal = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref<UserDetails | null>(null)
const currentUserId = ref(store.user?.id || '')

const newUser = ref({
  name: '',
  email: '',
  password: '',
})

const roleSelectedId = ref<any | null>(null)

const fetchUsers = async () => {
  try {
    const data = await getUsers()
    users.value = data
  } catch (error) {
    console.error('Failed to fetch users:', error)
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const data = await getRoles()
    roles.value = data
    roleSelectedId.value = data.length > 0 ? data.find((role) => role.name === 'user')?.id : null
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    loading.value = false
  }
}

const fetchData = async () => {
  await fetchUsers()
  await fetchRoles()
  loading.value = false
}

const createUser = async () => {
  try {
    isProcessing.value = true

    const result = await apiCreateUser({
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      roles: roles.value.filter((role) => role.id === roleSelectedId.value) as unknown as Role[],
    })

    if (result) {
      await fetchData()
      showCreateUserModal.value = false
      newUser.value = {
        name: '',
        email: '',
        password: '',
      }
      roleSelectedId.value =
        roles.value.length > 0 ? roles.value.find((role) => role.name === 'user')?.id : null
    }
  } catch (error) {
    console.error('Failed to create user:', error)
  } finally {
    isProcessing.value = false
  }
}

const confirmDeleteUser = (user: UserDetails) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    isProcessing.value = true
    const success = await apiDeleteUser(userToDelete.value.id)

    if (success) {
      await fetchUsers()
      showDeleteModal.value = false
      userToDelete.value = null
    }
  } catch (error) {
    console.error('Failed to delete user:', error)
  } finally {
    isProcessing.value = false
  }
}

const promoteUser = async (userId: string) => {
  try {
    isProcessing.value = true
    const success = await promoteAdmin(userId)
    // console.log('Promote user success:', success)

    if (success) {
      await fetchUsers()
    }
  } catch (error) {
    console.error('Failed to promote user:', error)
  } finally {
    isProcessing.value = false
  }
}

const demoteUser = async (userId: string) => {
  try {
    isProcessing.value = true
    const success = await demoteAdmin(userId)
    // console.log('Demote user success:', success)

    if (success) {
      await fetchUsers()
    }
  } catch (error) {
    console.error('Failed to demote user:', error)
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

<style scoped>
.admin-users {
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

.users-container {
  margin-top: 20px;
}

.loading,
.no-users {
  text-align: center;
  padding: 40px;
  color: #666;
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.create-user-btn {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.create-user-btn:hover {
  background-color: #3aa876;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.users-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.role-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
}

.role-badge.admin {
  background-color: #dc3545;
  color: white;
}

.role-badge.user {
  background-color: #17a2b8;
  color: white;
}

.actions {
  display: flex;
  gap: 8px;
}

.promote-btn,
.demote-btn,
.delete-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.3s;
}

.promote-btn {
  background-color: #28a745;
  color: white;
}

.promote-btn:hover {
  background-color: #218838;
}

.demote-btn {
  background-color: #ffc107;
  color: #212529;
}

.demote-btn:hover {
  background-color: #e0a800;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.submit-btn,
.delete-btn-confirm {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.cancel-btn {
  background-color: #f2f2f2;
  color: #2c3e50;
}

.cancel-btn:hover {
  background-color: #e2e2e2;
}

.submit-btn {
  background-color: #42b983;
  color: white;
}

.submit-btn:hover {
  background-color: #3aa876;
}

.delete-btn-confirm {
  background-color: #dc3545;
  color: white;
}

.delete-btn-confirm:hover {
  background-color: #c82333;
}

.confirmation .warning {
  color: #dc3545;
  font-size: 0.9rem;
  margin-bottom: 20px;
}
</style>
