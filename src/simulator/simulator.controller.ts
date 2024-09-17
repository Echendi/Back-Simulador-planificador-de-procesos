import { Controller, Post } from '@nestjs/common';
import { ProcessService } from '../process/process.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { Process } from '../process/entities/process.entity';
import { SchedulerType } from '../scheduler/entities/escheduler-type.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('simulator')
@ApiTags('similator')
export class SimulatorController {
    constructor(private readonly processService: ProcessService, private readonly scheduler: SchedulerService) { }

    @Post()
    @ApiOperation({ summary: 'Iniciar simulacións' })
    initSimulation() {
        const clock = 25
        const type = SchedulerType.SRTF
        // SJN
        // const p1 = new Process(2, 2, 2)
        // const p2 = new Process(4, 6, 3)
        // const p3 = new Process(1, 0, 6)
        // const p4 = new Process(3, 4, 8)

        // SRTF
        const p1 = new Process(1, 0, 6)
        const p2 = new Process(2, 2, 2)
        const p3 = new Process(3, 4, 8)
        const p4 = new Process(4, 6, 3)
        
        const processList = [p1, p2, p3, p4]
        this.processService.setProcessList(processList)
        this.processService.sortProcessList(type)
        this.scheduler.setSheduler({ type, processList })

        for (let i = 0; i <= clock; i++) {
            this.scheduler.clockEvent()
        }
    }
}
