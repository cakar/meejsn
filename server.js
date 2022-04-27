const express = require("express")
const app = express()
const expressLayouts = require("express-ejs-layouts")

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
app.use(express.urlencoded({extended:false}));

const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', ()=> console.log('connected to Mongodb'))

app.set("view engine", "ejs")
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

app.use('/', indexRouter)
app.use('/authors', authorRouter)


app.listen(process.env.PORT || 3002)