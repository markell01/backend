import { IsNumber, IsString } from "class-validator"

export class SaveResultDto {
    @IsNumber()
    wpm!: number

    @IsNumber()
    correctChars!: number

    @IsNumber()
    accuracy!: number

    @IsNumber()
    mistakes!: number

    @IsNumber()
    cpm!: number

    @IsString()
    userId!: string
}

export class MatchDto {
    @IsString()
    userId!: string
}
