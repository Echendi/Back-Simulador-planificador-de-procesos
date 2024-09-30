import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateSimulationInput } from './dto/create-simulation.input';
import { SimulatorService } from './simulator.service';

@Controller('simulator')
@ApiTags('similator')
export class SimulatorController {
    constructor(private readonly simulator: SimulatorService) { }

    @Post()
    @ApiOperation({ summary: 'Iniciar simulación' })
    initSimulation(@Body() input: CreateSimulationInput) {
        return this.simulator.init(input)
    }
}
