import axios from 'axios'

const baseURL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1'
const secretKey = process.env.CHAPA_SECRET_KEY

if (!secretKey) {
  throw new Error('CHAPA_SECRET_KEY is not configured')
}

export const chapa = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  },
})
