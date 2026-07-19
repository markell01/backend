import { IsIn, IsNumber, IsOptional, IsString } from "class-validator"

export const MATCH_UPDATE_STATUSES = ['ACTIVE', 'CANCELED'] as const;
export type MatchUpdateStatus = (typeof MATCH_UPDATE_STATUSES)[number];

export class SaveResultDto {
    @IsNumber()
    result!: number

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
    @IsOptional()
    @IsString()
    status?: string

    @IsNumber()
    time!: number

    @IsString()
    userId!: string
}

export class MatchUpdateDto {
    @IsIn(MATCH_UPDATE_STATUSES)
    @IsString()
    status!: MatchUpdateStatus
}
