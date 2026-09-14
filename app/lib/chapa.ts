import axios from 'axios'

export const chapa = axios.create({
  baseURL: process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1',
  headers: {
    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
})