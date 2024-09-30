import { IsInt, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProcessInput {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del proceso',
  })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({
    example: 5,
    description: 'Tiempo en el que el proceso llega',
  })
  @IsInt()
  @Min(0)
  timeArrive: number;

  @ApiProperty({
    example: 10,
    description: 'Tiempo total de ejecución del proceso (burst time)',
  })
  @IsInt()
  @IsPositive()
  burstTime: number;
}
