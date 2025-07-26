import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendEmailCodeDto } from './dto/send-email-code.dto';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponse
} from '@nestjs/swagger';
import { SwaggerResponseDecorator } from '../common/decorators/swagger-response.decorator';
import { LoginByEmailResponse } from './responses/login-by-email.response';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(204)
  @ApiNotFoundResponse({
    example: {
      message: 'Код не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Код не найден'
  })
  @ApiForbiddenResponse({
    example: {
      message: 'Email не подтвержден',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Email не подтвержден'
  })
  @ApiBadRequestResponse({
    example: {
      message: 'Проверьте код на почте',
      error: 'Bad Request',
      statusCode: 400
    },
    description: 'Проверьте код на почте'
  })
  @Post('email-code')
  async sendCode(@Body() sendEmailCodeDto: SendEmailCodeDto) {
    return this.authService.sendEmailCode(sendEmailCodeDto);
  }

  @ApiNotFoundResponse({
    example: {
      message: 'Проверьте email',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Проверьте email'
  })
  @ApiForbiddenResponse({
    example: {
      message: 'Email не подтвержден',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Email не подтвержден'
  })
  @ApiBadRequestResponse({
    example: {
      message: 'Неверный код',
      error: 'Bad Request',
      statusCode: 400
    },
    description: 'Неверный код'
  })
  @SwaggerResponseDecorator(201, 'Ok', LoginByEmailResponse)
  @Post('login-by-email')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
