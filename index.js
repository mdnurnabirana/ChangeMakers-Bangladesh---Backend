const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send("Together, Make Bangladesh Great!")
})

app.listen(port, () => {
  console.log(`ChangeMakers Backend app listening on port ${port}`)
})