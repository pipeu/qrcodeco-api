let AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()



// Instantiate a table
const dynamoTable = {
  // Specify table name (used by DynamoDB)
  name: 'qrcodeco',
  // Define partition and sort keys
  partitionKey: 'pk',
  sortKey: 'sk'
}

const Scan = {
  // Specify entity name
  name: 'Scan',
  created: 'created',
  modified: 'modified',
  // Define attributes
  attributes: {
    code: { partitionKey: true }, // flag as partitionKey - qrcode code like GDFQSX or https://qrcode.co/coze/loja
    sk: { hidden: true, sortKey: true }, // flag as sortKey and mark hidden
    status: ['sk',0], // composite key mapping
    _ct: ['sk',1], // composite key mapping
    store_id: { type: 'number' }, // set the attribute type
    store_name: { type: 'string' }, // set the attribute type
    scans: { type: 'number' } // set the attribute type
  },
  // Assign it to our table
  table: dynamoTable
}



class ScanServices {
  constructor () {
    this.PREPARE_TO_DELIVER_STATUS = 1
  }

  async increment (storeId, storeName, codePageOther) {
    console.log(`increment ${storeId} ${storeName} ${codePageOther}`)

    let item = {
      pk: codePageOther,
      sk: 'active',
      store_id: storeId,
      store_name: storeName,
      status: 'active',
      // scans: 2,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }

    // https://stackoverflow.com/questions/40561484/what-data-type-should-be-use-for-timestamp-in-dynamodb
    // Save date as epoch as well to be able to do queries in date in a differente way
    var date = new Date();
    var epoch = date.getTime();
    // converting back to date-time
    var initial_date = new Date(epoch);

    // FilterExpression: “start_date BETWEEN :date1 and :date2”

    try {
      let params = {
        TableName: 'qrcodeco',
        Key: {
          'pk': codePageOther,
          'sk': 'active'
        },
        Item: item,
        UpdateExpression:
            'SET scans = if_not_exists(scans, :initial) + :incr, store_id = :storeId, store_name = :storeName',
        ExpressionAttributeValues: {
          ':initial': 0,
          ':incr': 1,
          ':storeId': storeId,
          ':storeName': storeName
        },
        ReturnValues: 'UPDATED_NEW'
      }

      let result = await ddb.update(params).promise()
      console.log('result', result)

    }catch (err) {
      console.log('Error while increment : ', err)
      throw err
    }
  }


}

export default new ScanServices()
