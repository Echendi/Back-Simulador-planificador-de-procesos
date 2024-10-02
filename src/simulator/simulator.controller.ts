import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateSimulationInput } from './dto/create-simulation.input';
import { SimulatorService } from './simulator.service';
import { CreateRandomSimulationInput } from './dto/create-random-simulation.input';

@Controller('simulator')
@ApiTags('similator')
export class SimulatorController {
    constructor(private readonly simulator: SimulatorService) { }

    @Post()
    @ApiOperation({ summary: 'Iniciar simulación' })
    initSimulation(@Body() input: CreateSimulationInput) {
        return this.simulator.init(input)
    }
   
    @Post('/random')
    @ApiOperation({ summary: 'Iniciar simulacióncon procesos generados aleatoriamente' })
    initRandomSimulation(@Body() input: CreateRandomSimulationInput) {
        return this.simulator.initRandom(input)
    }
}
