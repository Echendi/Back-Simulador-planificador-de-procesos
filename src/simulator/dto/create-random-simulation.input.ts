import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive } from "class-validator"
import { SchedulerType } from "../../scheduler/entities/escheduler-type.enum"

export class CreateRandomSimulationInput {
    @ApiProperty({
        description: 'Cantidad de procesos a simular',
        example: 5
    })
    @IsInt()
    @IsPositive()
    processAmount: number
    
    @ApiProperty({
        description: 'Tiempo de reloj máximo para la llegada de los procesos',
        example: 20
    })
    @IsInt()
    @IsPositive()
    maxArrivalTime: number
    
    @ApiProperty({
        description: 'Tiempo de ráfaga mínimo para cada proceso',
        example: 1
    })
    @IsInt()
    @IsPositive()
    minBurstTime: number
    
    @ApiProperty({
        description: 'Tiempo de ráfaga máximo para cada proceso',
        example: 10
    })
    @IsInt()
    @IsPositive()
    maxBurstTime: number

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
    quantum?: number

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