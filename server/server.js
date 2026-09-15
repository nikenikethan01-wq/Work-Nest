import express from 'express'
import 'dotenv/config'

const PORT = 3000
const app = express()

app.use(cors())

app.get('/', (req, res) => {})

app.listen(PORT, () => {
  console.log('Listening on port : ', PORT)
})
