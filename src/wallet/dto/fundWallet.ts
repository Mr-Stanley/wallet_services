import { IsNumber, IsPositive, Min, IsOptional, IsString } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
