const express = require('express')
const cookieparser = require('cookie-parser')
const router = require('./routes/auth.routes')


const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser())
app.use('/api/auth', router)
module.exports = app