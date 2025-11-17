import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in the correct format, return it
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // If data has message and data properties
        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          return {
            success: true,
            ...data,
          };
        }

        // If data has pagination
        if (data && typeof data === 'object' && 'pagination' in data) {
          return {
            success: true,
            data: data.data,
            pagination: data.pagination,
            message: data.message,
          };
        }

        // Default transformation
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
