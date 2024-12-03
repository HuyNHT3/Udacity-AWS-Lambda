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
    const s3ImagePath = "https://serverless-todo-bucket-dev.s3.us-east-1.amazonaws.com/"
    const documentClient = new DynamoDB()
    const dynamoDbClient = DynamoDBDocument.from(documentClient)
    const result = await dynamoDbClient.scan({
      TableName: "Todos-dev",
      Limit: 30
    })
    console.log("get todos: " + JSON.stringify(result));

    const responses = {
      "items": buildItemList(result.Items, s3ImagePath)
    }

     return await response(200, responses, 'application/json')
  })

function buildItemList(resultItems, s3ImagePath) {
  const mappedItems = resultItems.map(item => {
    return {
      "todoId": item.todoId,
      "userId": item.userId,
      "attachmentUrl": s3ImagePath + item.todoId +".JPG",
      "dueDate": JSON.parse(item.description).dueDate,
      "createdAt": item.createdAt,
      "name": JSON.parse(item.description).name,
      "done": JSON.parse(item.description).done
    }
  })

  return mappedItems
}
