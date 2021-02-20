// Require AWS SDK and instantiate DocumentClient
const DynamoDB = require('aws-sdk/clients/dynamodb')
const DocumentClient = new DynamoDB.DocumentClient()

const { Table, Entity } = require('dynamodb-toolbox')

// Instantiate a table
const dynamoTable = new Table({
  // Specify table name (used by DynamoDB)
  name: 'qrcodeco',

  // Define partition and sort keys
  partitionKey: 'pk',
  sortKey: 'sk',

  // Add the DocumentClient
  DocumentClient
})

const Scan = new Entity({
  // Specify entity name
  name: 'Scan',
  created: 'created',
  modified: 'modified',

  // Define attributes
  attributes: {
    code: { partitionKey: true }, // flag as partitionKey - qrcode code like GDFQSX or https://qrcode.co/coze/loja
    sk: { hidden: true, sortKey: true }, // flag as sortKey and mark hidden
    status: ['sk',0], // composite key mapping
    created: ['sk',1], // composite key mapping
    store_id: { type: 'number' }, // set the attribute type
    store_name: { type: 'string' }, // set the attribute type
    scans: { type: 'number' } // set the attribute type
  },

  // Assign it to our table
  table: dynamoTable
})



class ScanServices {
  constructor () {
    this.PREPARE_TO_DELIVER_STATUS = 1
  }

  async increment (storeId, storeName, codePageOther) {
    console.log(`increment ${storeId} ${storeName} ${codePageOther}`)

    try {

      // Create my item (using table attribute names or aliases)
      // let item = {
      //   code: 'https://qrcode.co/coze/loja',
      //   store_id: storeId,
      //   store_name: storeName,
      //   status: 'active',
      // }

      let item = {
        code: codePageOther,
        store_id: storeId,
        store_name: storeName,
        status: 'active',
        scans: { $add: 1 }
      }

      // Use the 'put' method of Customer
      let result = await Scan.put(item)
      console.log(`result increment scan `, result)

      return result

    }catch (err) {
      console.log('Error while increment scan : ', err)
      throw err
    }
  }

}

export default new ScanServices()
