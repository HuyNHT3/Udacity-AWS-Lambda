import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { response } from '../../utils/response.mjs'
import { handler as auth0Handler } from '../auth/auth0Authorizer.mjs'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  ).handler(async (event) => {
    let updateTodo = await JSON.parse(event.body)
    const todoId = event.pathParameters.todoId
    console.log("newTodo: " + JSON.stringify(updateTodo))
    const userInfo = await auth0Handler(event)
    const userId = userInfo.principalId.split('|')[1]
    console.log("userId: " + JSON.stringify(userId))
    console.log("key: " + JSON.stringify({Key: {
      userId: { S: userId },
      todoId: { S: todoId },
    }}))

    // handler(event)
    // TODO: Implement creating a new TODO item
    const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

    const params = {
      TableName: "Todos-dev",
      Key: {
        userId:  userId,
        todoId:  todoId,
      },
      UpdateExpression: 'SET #description = :description',
      ExpressionAttributeNames: {
        '#description': 'description'
      },
      ExpressionAttributeValues: {
        ':description': JSON.stringify(updateTodo) 
      },
      ReturnValues: 'UPDATED_NEW'
    };
    console.log ("add item: " + JSON.stringify(updateTodo))

    try {
      const result = await dynamoDbDocument.update(params)
      console.log('Item updated successfully:', result);
      updateTodo = {
        "item": {
          ...updateTodo,
        "todoId": todoId,
        attachmentUrl: ""
        }
      }
    }
    catch (error) {
      console.error('Error updating item:', error);
    }

    return await response(200, updateTodo,'application/json')
  })