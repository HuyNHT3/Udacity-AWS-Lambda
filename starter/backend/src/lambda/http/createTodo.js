import { handler as auth0Handler } from '../auth/auth0Authorizer.mjs'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { response } from '../../utils/response.mjs'
import { randomUUID } from 'crypto'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {

    let newTodo = await JSON.parse(event.body)
    console.log("newTodo: " + JSON.stringify(newTodo))
    const userInfo = await auth0Handler(event)
    const userId = userInfo.principalId.split('|')[1]
    console.log("userId: " + JSON.stringify(userId))

    // handler(event)
    // TODO: Implement creating a new TODO item
    const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())
    const addedItem =  {
      userId: userId,       // Partition key
      todoId: randomUUID(),       // Sort key
      createdAt: new Date().toISOString(), // Attribute for LSI
      status: 'in-progress',   // Additional attribute
      description: JSON.stringify(newTodo)
    }
    console.log ("add item: " + JSON.stringify(addedItem))
    try {
      const result = await dynamoDbDocument.put({
        TableName: "Todos-dev",
        Item: addedItem
      })
      console.log('Item added successfully:', result);
      newTodo = {
        "item": {
          ...newTodo,
        "todoId": result.$metadata.requestId,
        "done": false,
        attachmentUrl: ""
        }
      }
    }
    catch (error) {
      console.error('Error adding item:', error);
    }

    return await response(200, newTodo,'application/json')
    
    // await {
    //   statusCode: 200,
    //   body: JSON.stringify({
    //     ...newTodo,
    //     ...{ todoId: "123", done: false, attachmentUrl: "" }
    //   })
    // }
  })