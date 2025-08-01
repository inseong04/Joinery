import { Body, Controller, Get, Post, Res, UseGuards, } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { Verification } from './schema/verification.schema';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guard/auth.guard';
import { CommonResponses, LoginResponse, SignUpResponse } from '../swagger/responses';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({
        summary:'로그인',
        description: '사용자 아이디와 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.'
    })
    @ApiBody({
        type: SignInDto,
        description: '로그인 정보'
    })
    @ApiCreatedResponse({
        description: '로그인 성공 시 JWT 토큰 반환',
        schema: LoginResponse
    })
    @ApiResponse({
        status: 401,
        description: '로그인 실패 - 잘못된 아이디 또는 비밀번호',
        schema: CommonResponses.unauthorized
    })
    @Post('/sign-in')
    async signIn(@Body() signInDto: SignInDto, @Res() res: Response): Promise<any> {
        const jwt = await this.authService.validateUser(signInDto);
        res.setHeader('Authorization', 'Bearer '+jwt?.accessToken);
        return res.json(jwt);
    }

    @ApiOperation({
        summary:'회원가입',
        description: '새로운 사용자 계정을 생성합니다. 아이디, 비밀번호, 닉네임, 성별, 생년월일, 여행 스타일, 자기소개가 필요합니다.'
    })
    @ApiBody({ 
        type: SignUpDto,
        description: '회원가입 정보'
    })
    @ApiCreatedResponse({
        description: '회원가입 성공시 생성된 사용자 정보 반환',
        schema: SignUpResponse
    })
    @ApiResponse({
        status: 400,
        description: '회원가입 실패 - 잘못된 입력 데이터',
        schema: CommonResponses.validationError
    })
    @ApiResponse({
        status: 409,
        description: '회원가입 실패 - 이미 존재하는 아이디',
        schema: CommonResponses.conflict
    })
    @Post('/sign-up')
    async create(@Body() signUpDto:SignUpDto) : Promise<Verification> {
        return this.authService.create(signUpDto);
    }

    @ApiOkResponse({
        description: 'JWT 인증 성공',
        schema: CommonResponses.success
    })
    @ApiOperation({
        summary:'JWT 토큰 검증',
        description: '현재 JWT 토큰의 유효성을 검증합니다. 인증이 필요한 API를 테스트할 때 사용합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiResponse({
        status: 401,
        description: 'JWT 토큰이 유효하지 않음',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Get('/token-test')
    async testToken() {
        return 'success'
    }
    


}
