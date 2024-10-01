import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SchedulerType } from '../../scheduler/entities/escheduler-type.enum';
import { CreateProcessInput } from '../../process/dto/create-process.input';
import { Type } from 'class-transformer';


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
        type: [CreateProcessInput],
        description: 'Arreglo de procesos.',
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
        description: 'Indica si se debe habilitar el procesamiento por lotes.',
        example: true
    })
    @IsBoolean()
    enableBatchProcessing: boolean = false;

    @ApiProperty({
        example: 5,
        description: 'Lapso de tiempo para cada lote',
        required: false
    })
    @IsPositive()
    @IsInt()
    @IsOptional()
    batchCount?: number
}

