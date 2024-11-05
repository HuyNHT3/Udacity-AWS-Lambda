import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJL0SqJwJmidajMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1yaTZta2h5cm4xZ3dyYXRtLnVzLmF1dGgwLmNvbTAeFw0yNDExMDMw
ODI3NDVaFw0zODA3MTMwODI3NDVaMCwxKjAoBgNVBAMTIWRldi1yaTZta2h5cm4x
Z3dyYXRtLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMk3opBHNh+CVAnKZOabGd83y2YqeUW1vFVLrQE2p7f52dgq9CzopkeRKPzh
zv2R/+DeOhb052scdI58Id4fnQx0GedlTtuT9XGlWwVlvltFAiFD3xFPG6dzpd0h
85C1V3r4ddSUCOJTNfHUo0IqlYTUQNj/AKSYEUTG9pQV479Nlf5mImxY2dx++tWK
VeByy597ux0G1MP+X6tqtTdD4E5KZgvGko+23e4uxuERftZOwyUYwk2k5Btn174k
jdC8N9IkOLogM9cGD79AO88SeDQrRuotfGKGBo4NXjhH6BeiR8DWfj6F5TxFkT3G
aVF5KG9VsbVWbVqhceVxDK3vXY0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUcspMnSOYLUVWZdcewIrUFlvHMr8wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQA0FwRY8IW3bEZxiTd4z3I/2EsahYKEMQb84gGpXm2e
Jf8i1I43Nk9zcVU4hWP4+8bKyRORlSZW4uByCkWz76Qb8bCbJGv1i2DywewNHfpC
vnyUYZNxhDUzIdB0+LnZLwNk1mWF9Rn2LlBW2w9tPyekSEK+UHwsBL5syjCgUyhq
cjbk0VQjLZ6abjleVE9k8F0iOffJb66vvmNL8250WIHh3uJxfZKyDCePJoY32k36
EHs6xgrrEEXNLuvTlmADmN4dyzn+wJLCSQFXAQM6bb9DK/dR/2k3roqppyK6BnD9
dY14ZsFJpbNnqNZddB24AwFu1XRvuC/393eMdwBCRocC
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  return undefined;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
