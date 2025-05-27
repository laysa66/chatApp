import { defineStore } from 'pinia'
import type { UserDetails } from '../../../common/src'
import Cookies from 'js-cookie'

interface AuthState {
  user: UserDetails | null
  token: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: Cookies.get('site') || '',
  }),
  getters: {
    getToken: (state) => state.token,
    isAdmin: (state) => state.user?.roles.find((role) => role.name === 'admin') !== undefined,
  },
  actions: {
    async loginWithToken(token: string) {
      if (!token) throw new Error('Token error')
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({ token }),
        })
        if (!res.ok) throw new Error(res.statusText)
        const userDetails = (await res.json()) as UserDetails & { token: string }
        this.login({ ...userDetails, token })
      } catch (e) {
        console.error(e)
      }
    },
    // i used this as example to refresh the token, as it expires in 7 days, it's helpful to have it 
    // you can change it to a more shorter time 
    login(data: UserDetails & { token: string }) {
      this.user = { id: data.id, name: data.name, email: data.email, roles: data.roles }
      this.token = data.token
      Cookies.set('site', data.token, { expires: 7, secure: true, sameSite: 'strict' })
    },
    logout() {
      this.user = null
      this.token = ''
      Cookies.remove('site')
    },
  },
})
