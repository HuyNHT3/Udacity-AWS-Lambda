
export async function response(status, data, responseType) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': responseType,
    },
    body: JSON.stringify(data),
  };
}
