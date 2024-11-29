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
    const userInfo = await auth0Handler(event)

    const documentClient = new DynamoDB()
    const dynamoDbClient = DynamoDBDocument.from(documentClient)
    const result = await dynamoDbClient.scan({
      TableName: "Todos-dev",
      Limit: 30
    })
    console.log("get todos: " + JSON.stringify(result));

    const responses = {
      "items": buildItemList(result.Items)
    }

     return await response(200, responses, 'application/json')
  })

function buildItemList(resultItems) {
  const mappedItems = resultItems.map(item => {
    return {
      "todoId": item.todoId,
      "userId": item.userId,
      "attachmentUrl": "https://serverless-c4-todo-images.s3.amazonaws.com/605525c4-1234-4d23-b3ff-65b853344123",
      "dueDate": JSON.parse(item.description).dueDate,
      "createdAt": item.createdAt,
      "name": JSON.parse(item.description).name,
      "done": false
    }
  })

  return mappedItems
}
