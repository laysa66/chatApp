<template>
  <PageLayout heading="Admin Dashboard">
    <div class="admin-dashboard">
      <div class="admin-nav">
        <router-link to="/admin" class="nav-link">Dashboard</router-link>
        <router-link to="/admin/users" class="nav-link">Users</router-link>
        <router-link to="/admin/rooms" class="nav-link">Rooms</router-link>
        <router-link to="/lobby" class="nav-link user-feature">Chat Lobby</router-link>
      </div>

      <div class="dashboard-grid">
        <div v-if="loading" class="loading">Loading statistics...</div>

        <div v-else>
          <!-- Top row with statistics cards -->
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <h3>Total Users</h3>
                <p class="stat-value">{{ statistics.totalUsers }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-comments"></i>
              </div>
              <div class="stat-content">
                <h3>Total Rooms</h3>
                <p class="stat-value">{{ statistics.totalRooms }}</p>
              </div>
            </div>
          </div>

          <!-- Second row with more statistics -->
          <div class="stats-row">
            <div class="stat-card highlight">
              <div class="stat-icon">
                <i class="fas fa-plug"></i>
              </div>
              <div class="stat-content">
                <h3>Connected Users</h3>
                <p class="stat-value">{{ statistics.connectedUsers }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="stat-content">
                <h3>Total Messages</h3>
                <p class="stat-value">{{ statistics.totalMessages }}</p>
              </div>
            </div>
          </div>

          <!-- Monthly User Connections Chart -->
          <div class="chart-container">
            <h2>Monthly User Connections</h2>
            <div v-if="loadingChart" class="loading-chart">
              <div class="spinner"></div>
              <p>Loading chart data...</p>
            </div>
            <div v-else-if="chartData.labels.length === 0" class="no-data">
              No monthly data available
            </div>
            <div v-else class="chart-wrapper">
              <BarChart :chartData="chartData" :options="chartOptions" class="user-chart" />
            </div>
          </div>

          <!-- Most Active Rooms -->
          <div class="active-rooms">
            <h2>Most Active Rooms</h2>
            <div v-if="statistics.activeRooms.length === 0" class="no-rooms">
              <p>No active rooms found</p>
            </div>
            <div v-else class="rooms-table-container">
              <table class="rooms-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Members</th>
                    <th>Messages</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="room in statistics.activeRooms" :key="room.id">
                    <td>{{ room.name }}</td>
                    <td>{{ room.memberCount }}</td>
                    <td>{{ room.messageCount }}</td>
                    <td>
                      <router-link :to="`/lobby/room/${room.id}`" class="view-room-btn">
                        View Room
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, computed } from 'vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import { getServerStatistics, getMonthlyUserStats } from '../../api/admin/adminService'
import { socket } from '../../main'
import { BarChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

interface ServerStatistics {
  totalUsers: number
  totalRooms: number
  totalMessages: number
  connectedUsers: number
  activeRooms: {
    id: string
    name: string
    memberCount: number
    messageCount: number
  }[]
}

interface MonthlyUserStats {
  month: string
  userCount: number
}

const statistics = ref<ServerStatistics>({
  totalUsers: 0,
  totalRooms: 0,
  totalMessages: 0,
  connectedUsers: 0,
  activeRooms: [],
})

const loading = ref(true)
const loadingChart = ref(true)
const monthlyStats = ref<MonthlyUserStats[]>([])

// Chart data and options
const chartData = computed(() => {
  const months = monthlyStats.value.map((stat) => {
    // Convert YYYY-MM to month name (Jan, Feb, etc.)
    const [year, month] = stat.month.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleString('en-US', { month: 'short' })
  })

  const userData = monthlyStats.value.map((stat) => stat.userCount)

  return {
    labels: months,
    datasets: [
      {
        label: 'Monthly Active Users',
        backgroundColor: '#42b983',
        borderColor: '#2c3e50',
        borderWidth: 1,
        borderRadius: 5,
        data: userData,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    tooltip: {
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#42b983',
      borderWidth: 1,
      callbacks: {
        label: function (context: any) {
          return `Users: ${context.raw}`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Users',
        color: '#2c3e50',
        font: {
          weight: 'bold',
        },
      },
      ticks: {
        precision: 0, // Only show whole numbers
      },
    },
    x: {
      title: {
        display: true,
        text: 'Month',
        color: '#2c3e50',
        font: {
          weight: 'bold',
        },
      },
    },
  },
}

// Function to fetch server statistics
const fetchStatistics = async () => {
  try {
    loading.value = true
    const data = await getServerStatistics()
    statistics.value = data
    loading.value = false
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    loading.value = false
  }
}

// Function to fetch monthly user statistics
const fetchMonthlyStats = async () => {
  try {
    loadingChart.value = true
    const data = await getMonthlyUserStats()
    // Sort data by month to ensure chronological order
    monthlyStats.value = data.sort((a, b) => a.month.localeCompare(b.month))
    loadingChart.value = false
  } catch (error) {
    console.error('Failed to fetch monthly statistics:', error)
    loadingChart.value = false
  }
}

// Socket listener for real-time updates
const handleUserConnectionUpdate = (count: number) => {
  statistics.value.connectedUsers = count
}

// Refresh statistics periodically
let refreshInterval: number
let chartRefreshInterval: number

onMounted(() => {
  // Fetch initial statistics
  fetchStatistics()
  fetchMonthlyStats()

  // Listen for real-time updates on connected users
  socket.on('user-connection-update', handleUserConnectionUpdate)

  // Refresh statistics every 30 seconds
  refreshInterval = window.setInterval(fetchStatistics, 30000)

  // Refresh chart data less frequently (every 5 minutes)
  chartRefreshInterval = window.setInterval(fetchMonthlyStats, 300000)
})

onBeforeUnmount(() => {
  // Remove the socket listener when component is unmounted
  socket.off('user-connection-update', handleUserConnectionUpdate)

  // Clear the refresh intervals
  clearInterval(refreshInterval)
  clearInterval(chartRefreshInterval)
})
</script>

<style scoped>
.admin-dashboard {
  padding: 0;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  color: #2c3e50;
}

.admin-nav {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
  flex-wrap: wrap;
  margin-top: 280px;
}

.nav-link {
  padding: 6px 12px;
  margin-right: 10px;
  margin-bottom: 4px;
  text-decoration: none;
  color: #2c3e50;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
}

.nav-link:hover {
  background-color: #f0f7f4;
  color: #42b983;
}

.router-link-active {
  background-color: #42b983;
  color: white;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 1rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-card {
  background: linear-gradient(145deg, #ffffff, #f5f7fa);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #42b983;
  border-radius: 2px 0 0 2px;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 15px;
  color: #42b983;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: rgba(66, 185, 131, 0.1);
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-card h3 {
  font-size: 1rem;
  margin: 0 0 6px 0;
  color: #718096;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2d3748;
}

.stat-card.highlight {
  background: linear-gradient(145deg, #42b983, #3aa876);
  color: white;
}

.stat-card.highlight::before {
  background: #fff;
}

.stat-card.highlight .stat-icon {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.stat-card.highlight h3,
.stat-card.highlight .stat-value {
  color: white;
}

.chart-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
}

.chart-container h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
  position: relative;
  padding-bottom: 12px;
}

.chart-container h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #42b983;
  border-radius: 3px;
}

.loading-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #718096;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 185, 131, 0.1);
  border-radius: 50%;
  border-top-color: #42b983;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.user-chart {
  width: 100%;
  height: 100%;
}

.no-data,
.no-rooms {
  text-align: center;
  padding: 40px;
  color: #718096;
  background-color: #f9fafb;
  border-radius: 8px;
  font-style: italic;
}

.active-rooms {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.active-rooms:hover {
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
}

.active-rooms h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 12px;
}

.active-rooms h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: #42b983;
  border-radius: 3px;
}

.rooms-table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
}

.rooms-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: #4a5568;
}

.rooms-table th,
.rooms-table td {
  padding: 14px 16px;
  text-align: left;
}

.rooms-table th {
  background-color: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
}

.rooms-table th:first-child {
  border-top-left-radius: 8px;
}

.rooms-table th:last-child {
  border-top-right-radius: 8px;
}

.rooms-table tr:nth-child(even) {
  background-color: #f9fafb;
}

.rooms-table tr:hover {
  background-color: #f0f7f4;
}

.rooms-table td {
  border-bottom: 1px solid #edf2f7;
}

.view-room-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  background-color: #42b983;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(66, 185, 131, 0.2);
}

.view-room-btn:hover {
  background-color: #3aa876;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
}

.view-room-btn:active {
  transform: translateY(0);
}

/* Add responsive design */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .stat-value {
    font-size: 2rem;
  }

  .chart-wrapper {
    height: 250px;
  }
}
</style>
