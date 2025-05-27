import { useAuthStore } from '@/stores/auth'
import type { RoomDetails, RoomDetailsWithMemberCount } from '../../../common/src'

export async function getRoom(roomId: string, token: string): Promise<RoomDetails | undefined> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId || ''}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      },
    })

    if (!res.ok) throw new Error(res.statusText)
    return (await res.json()) as RoomDetails
  } catch (err) {
    console.error(err)
    return undefined
  }
}

export async function leaveRoom(
  roomId: string,
  userId: string,
  token: string,
): Promise<boolean | undefined> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId}/members/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      },
      method: 'DELETE',
    })

    if (!res.ok) throw new Error(res.statusText)
    return true
  } catch (err) {
    console.error(err)
    return undefined
  }
}

export async function getAllRooms(): Promise<RoomDetailsWithMemberCount[]> {
  try {
    const store = useAuthStore()

    const token = store.getToken
    const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      },
    })

    if (!res.ok) throw new Error(res.statusText)
    return (await res.json()) as RoomDetailsWithMemberCount[]
  } catch (err) {
    console.error('Failed to fetch rooms:', err)
    return []
  }
}
