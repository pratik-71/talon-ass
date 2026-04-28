require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/authRoutes')
const charityRoutes = require('./routes/charityRoutes')
const subscriptionRoutes = require('./routes/subscriptionRoutes')
const subscriptionController = require('./controllers/subscriptionController')
const scoreRoutes = require('./routes/scoreRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/charities', charityRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.post('/api/webhook/paddle', subscriptionController.handleWebhook)

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

module.exports = app;
