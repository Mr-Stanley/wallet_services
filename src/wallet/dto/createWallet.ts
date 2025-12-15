import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  @IsIn(['USD'])
  currency?: string;
}

