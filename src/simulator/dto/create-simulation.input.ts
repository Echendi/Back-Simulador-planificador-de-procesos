import { ArrayMinSize, IsArray, IsEnum, IsIn, IsInt, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SchedulerType } from '../../scheduler/entities/escheduler-type.enum';
import { CreateProcessInput } from '../../process/dto/create-process.input';
import { Type } from 'class-transformer';

export class Batch {
    @ApiProperty({
        type: [CreateProcessInput],
        description: 'Arreglo de procesos en este lote.',
        example: [
            { id: 1, timeArrive: 5, burstTime: 10 },
            { id: 2, timeArrive: 6, burstTime: 8 }
        ]
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateProcessInput)
    processList: CreateProcessInput[];

    @ApiProperty({
        example: 1,
        description: 'Identificador único del lote',
    })
    @IsInt()
    @IsPositive()
    id: number
}


export class CreateSimulationInput {
    @ApiProperty({
        example: 10,
        description: 'Tiempo total de simulación en unidades de tiempo. Si no se pone este valor se  detentrá cundo termine todos los procesos',
        required: false
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    time?: number;

    @ApiProperty({
        enum: SchedulerType,
        example: SchedulerType.FCFS,
        description: 'Tipo de planificador utilizado en la simulación.',
    })
    @IsEnum(SchedulerType)
    type: SchedulerType;

    @ApiProperty({
        example: 2,
        description: 'Quantum (Para Round Robin).',
        required: false
    })
    @IsPositive()
    @IsInt()
    @IsOptional()
    quantum: number

    @ApiProperty({
        type: [Batch],
        description: 'Arreglo de lotes, cada uno contiene una lista de procesos.',
        example: [
            {
                processList: [
                    { id: 1, timeArrive: 5, burstTime: 10 },
                    { id: 2, timeArrive: 6, burstTime: 8 }
                ]
            }
        ]
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => Batch)
    batchList: Batch[];
}

