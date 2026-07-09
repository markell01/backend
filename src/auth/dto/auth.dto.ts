import { IsString, MaxLength, MinLength } from "class-validator"

export class RegisterDto {
    @IsString()
    @MinLength(5)
    @MaxLength(12)
    username!: string

    @IsString()
    @MinLength(6)
    password!: string
}

export class LoginDto {
    @IsString()
    username!: string

    @IsString()
    password!: string
}