const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.STORAGE_USERSTABLE_NAME;

exports.handler = async (event) => {
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : null;

  try {
    if (method === 'POST') {
      const item = {
        id: body.id,
        name: body.name,
        email: body.email,
      };

      await dynamo.put({
        TableName: TABLE_NAME,
        Item: item
      }).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'User created', item })
      };
    }

    if (method === 'GET') {
      const result = await dynamo.scan({ TableName: TABLE_NAME }).promise();
      return {
        statusCode: 200,
        body: JSON.stringify(result.Items)
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Unsupported method' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error', error })
    };
  }
};
