import axios, { AxiosRequestConfig, Method } from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

export class HttpRequestService {
  async request<T = any>(
    method: Method,
    url: string,
    data?: Record<string, any>,
    headers?: Record<string, string>,
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
      ...(method === 'GET' ? { params: data } : { data }),
    };

    try {
      const response = await axios<T>(config);
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (error?.response?.data as string | Record<string, any>) ||
          'Remote request error',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
