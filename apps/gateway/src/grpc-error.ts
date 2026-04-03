import { HttpException, HttpStatus } from '@nestjs/common';

export function mapGrpcError(error: any): never {
  const code = error?.code;
  const message = error?.details || error?.message || 'Internal server error';

  const grpcToHttp: Record<number, number> = {
    3: HttpStatus.BAD_REQUEST,
    5: HttpStatus.NOT_FOUND,
    6: HttpStatus.CONFLICT,
    7: HttpStatus.FORBIDDEN,
    9: HttpStatus.BAD_REQUEST,
    13: HttpStatus.INTERNAL_SERVER_ERROR,
    16: HttpStatus.UNAUTHORIZED,
  };

  throw new HttpException(
    {
      success: false,
      message,
    },
    grpcToHttp[code] || HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
