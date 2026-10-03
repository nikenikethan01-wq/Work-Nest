import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
})

socket.on('connect', () => {
  console.log('Connected : ', socket.id)
})

socket.on('connect_error', (err) => {
  console.error('Socket connection failed : ', err)
})

socket.on('test', (data) => {
  console.log(data)
})

socket.on('disconnect', () => {})

export default socket
