// server.js
var express = require('express')
var cors = require('cors')
var path = require('path')
var serveStatic = require('serve-static')
var enforce = require('express-sslify')

var app = express()

app.use(enforce.HTTPS({ trustProtoHeader: true }))

app.use(cors())
app.use(serveStatic(path.join(__dirname, '/dist')))

var port = process.env.PORT || 5000
app.listen(port)
console.log('starting project at ' + port)
