import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function SwaggerResponseDecorator(
  status: number,
  description: string,
  response: unknown
) {
  return applyDecorators(
    ApiResponse({
      status,
      schema: { example: response },
      description
    })
  );
}
