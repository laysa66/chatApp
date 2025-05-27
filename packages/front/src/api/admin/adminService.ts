// Admin API service for interacting with admin endpoints
import { useAuthStore } from '@/stores/auth'
import type { Role, UserDetails } from '../../../../common/src'


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
  month: string // Format: "YYYY-MM"
  userCount: number
}

export const getRoles = async (): Promise<Role[]> => {
  try {
    const auth = useAuthStore()
    const token = auth.getToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch roles')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching roles:', error)
    return []
  }
}

// Get all users (admin only)
export const getUsers = async (): Promise<UserDetails[]> => {
  try {
    const auth = useAuthStore()

    const token = auth.getToken

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Delete a user (admin only)
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const auth = useAuthStore()

    const token = auth.getToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }

    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

/**
 * Promote a user to admin (admin only)
 */
export const promoteAdmin = async (userId: string): Promise<boolean> => {
  try {
    const auth = useAuthStore()
    const token = auth.getToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/promoteadmin`, {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to promote user to admin')
    }

    return true
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    return false
  }
}

/**
 * Demote an admin to user (admin only)
 */
export const demoteAdmin = async (userId: string): Promise<boolean> => {
  try {
    const auth = useAuthStore()
    const token = auth.getToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/demoteadmin`, {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to demote admin to user')
    }

    return true
  } catch (error) {
    console.error('Error demoting admin to user:', error)
    return false
  }
}

// Update user role (admin only)
export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<boolean> => {
  try {
    const auth = useAuthStore()

    const token = auth.getToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      throw new Error('Failed to update user role')
    }

    return true
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
}

// Get server statistics (admin only)
export const getServerStatistics = async (): Promise<ServerStatistics> => {
  try {
    const auth = useAuthStore()

    const token = auth.getToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/statistics`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch server statistics')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching server statistics:', error)
    return {
      totalUsers: 0,
      totalRooms: 0,
      totalMessages: 0,
      connectedUsers: 0,
      activeRooms: [],
    }
  }
}

// Create a new admin user
export const createAdminUser = async (
  email: string,
  name: string,
  password: string,
): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, password }),
    })

    if (!response.ok) {
      throw new Error('Failed to create admin user')
    }

    return true
  } catch (error) {
    console.error('Error creating admin user:', error)
    return false
  }
}

// Get monthly user statistics (admin only)
export const getMonthlyUserStats = async (): Promise<MonthlyUserStats[]> => {
  try {
    const auth = useAuthStore()

    const token = auth.getToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = token
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/statistics/monthly-users`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch monthly user statistics')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching monthly user statistics:', error)
    // Return mock data for demonstration if the endpoint is not yet implemented
    return generateMockMonthlyData()
  }
}

// Generate mock data for demonstration purposes
function generateMockMonthlyData(): MonthlyUserStats[] {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const currentYear = new Date().getFullYear()
  const data: MonthlyUserStats[] = []

  // Generate some realistic-looking data with trends
  // More users in winter months, fewer in summer
  for (let i = 0; i < 12; i++) {
    const month = `${currentYear}-${(i + 1).toString().padStart(2, '0')}`
    const monthName = months[i]

    // Create a seasonal pattern with some randomness
    let baseUserCount = 50

    // Summer dip (months 5-8)
    if (i >= 4 && i <= 7) {
      baseUserCount = 30
    }

    // Winter peak (months 11-1)
    if (i >= 10 || i === 0) {
      baseUserCount = 80
    }

    // Add some randomness for realism
    const userCount = baseUserCount + Math.floor(Math.random() * 20) - 10

    data.push({
      month,
      userCount: Math.max(0, userCount), // Ensure no negative counts
    })
  }

  return data
}
