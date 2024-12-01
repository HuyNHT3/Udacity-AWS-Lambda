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
    const todoId = event.pathParameters.todoId
    const userInfo = await auth0Handler(event)
    console.log("userInfo: " + userInfo)
    const userId = userInfo.principalId.split('|')[1]
    try {
      const params = {
        TableName: "Todos-dev",
        Key: {
          userId: userId,
          todoId: todoId
        }
      };

      const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())
      const result = await dynamoDbDocument.delete(params);
      console.log("Item deleted successfully:", result);
    } catch (error) {
      console.error("Error deleting item:", error);
    }

    // TODO: Remove a TODO item by id
    return response(200, todoId, 'application/json')
  })

