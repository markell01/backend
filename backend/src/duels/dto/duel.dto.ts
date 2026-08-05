import { IsNumber, IsString } from 'class-validator';

export class DuelDto {
  @IsString()
  userId!: string;
}

export class JoinDuelDto {
  @IsString()
  duelId!: string;

  @IsString()
  userId!: string;
}

export class UpdateUserProgressDto {
  @IsString()
  duelId!: string;

  @IsString()
  userId!: string;

  @IsNumber()
  typedLength!: number;

  @IsNumber()
  correctChars!: number;

  @IsNumber()
  mistakes!: number;

  @IsNumber()
  accuracy!: number;

  @IsNumber()
  cpm!: number;

  @IsNumber()
  wpm!: number;
}

export class FinishDuelDto {
  @IsString()
  duelId!: string;

  @IsString()
  userId!: string;

  @IsString()
  inputValue!: string;
}
