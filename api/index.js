const express = require('express')
const app = express()

const helmet = require('helmet')
app.use(helmet())

const v1 = require('./v1')

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.use('/v1', v1)

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
