// eslint-disable-next-line no-useless-catch
'use strict'
import service from './services/ScanServices'

const apiVersion = 'v1.0' // Require and init API router module
const app = require('lambda-api')({ version: apiVersion,
  base: 'scan',
  logger: {
    level: 'info', // debug
    timestamp: () => new Date().toUTCString(), // custom timestamp
    stack: true
  } })



app.use((req, res, next) => {
  res.cors() // Define Middleware
  next()
})

const generateResult = (status, result) => {
  return {
    status: status,
    data: result,
    version: apiVersion,
    stage: '' + process.env.stage
  }
}

const generateError = (keyValueJsonError, message) => {
  return {
    errors: keyValueJsonError, // { variableNameKey}
    message: message,
    version: apiVersion,
    stage: '' + process.env.stage
  }
}


app.put('/increment', async (req, res) => {
  console.log('increment scan req.body', req.body)
  try {

    await service.increment(req.body.store_id, req.body.store_name, req.body.code)

    return generateResult('ok', 'incremented')

  } catch (e) {
    console.log('Error incrementing scan', JSON.stringify(e))
    res.error(400, JSON.stringify(e))
  }
})


app.options('/*', (req, res) => {
  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,StoreId,storeid')
  res.status(200).send({})
})


export const router = async (event, context) => {
  console.log('qrcode-api-scan process.env.stage:' + process.env.stage)
  console.log('qrcode-api-scan current env:' + process.env.MESSAGE)

  context.callbackWaitsForEmptyEventLoop = false

  return await app.run(event, context)
}
