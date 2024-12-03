import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { response } from '../../utils/response.mjs'
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

    const s3Client = new S3Client({ region: "us-east-1" });

    const bucketName = "serverless-todo-bucket-dev";
    const objectKey = todoId + ".JPG";

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: "image/jpeg"
    });

    try {
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
      return response(200, { uploadUrl: uploadUrl }, 'application/json')
    } catch (err) {
      console.error("Error generating upload URL:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error generating upload URL' })
      };
    }
  })
