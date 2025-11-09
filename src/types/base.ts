export interface ApiEnvelope<T> {
  isSuccess: boolean;
  responseCode: string;
  statusCode: number;
  data: T;
  message: string;
}

export type Id = number;
