import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendEmailCodeDto } from './dto/send-email-code.dto';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiResponse } from '@nestjs/swagger';
import { SwaggerResponseDecorator } from '../common/decorators/swagger-response.decorator';
import { LoginByEmailResponse } from './responses/login-by-email.response';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(204)
  @Post('email-code')
  async sendCode(@Body() sendEmailCodeDto: SendEmailCodeDto) {
    return this.authService.sendEmailCode(sendEmailCodeDto);
  }

  @SwaggerResponseDecorator(201, 'Ok', LoginByEmailResponse)
  @Post('login-by-email')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
