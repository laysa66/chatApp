import type { Role } from '../../../common/src'

interface CreateUserInput {
  name: string
  email: string
  password: string
  roles?: Role[]
}



export const createUser = async (userData: CreateUserInput) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error('Failed to create user')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Error logging in:', error)
    return null
  }
}
