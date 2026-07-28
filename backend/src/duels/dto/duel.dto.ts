import { IsString } from "class-validator";

export class DuelDto {
    @IsString()
    userId!: string
}