import type { Message } from '../../../common/src'

export async function getMessages(roomId: string, token: string): Promise<Message[]> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId}/messages`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      },
    })

    if (!res.ok) throw new Error(res.statusText)
    return (await res.json()) as Message[]
  } catch (err) {
    console.error('Failed to get messages', err)
    return []
  }
}
