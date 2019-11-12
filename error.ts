export class ApiError extends Error {
  constructor(readonly code: number, body: string) {
    super(body);
  }
}
export async function throwApiErrorIfNeeded(
  resp: Response,
  successStatus: number
) {
  if (resp.status !== successStatus) {
    throw new ApiError(resp.status, await resp.text());
  }
}
