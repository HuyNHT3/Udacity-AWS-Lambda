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
  ). handler(async (event) => {
    const todoId = event.pathParameters.todoId
    const userInfo = await auth0Handler(event)

    // TODO: Remove a TODO item by id
    return response(200,todoId, 'application/json')
  }) 
  
  
  
  
//   {
//   const todoId = event.pathParameters.todoId

//   // TODO: Remove a TODO item by id
//   return undefined
// }

