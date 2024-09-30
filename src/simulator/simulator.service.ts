import { Injectable } from '@nestjs/common';
import { CreateSimulationInput } from './dto/create-simulation.input';
import { ProcessService } from '../process/process.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { Log } from '../scheduler/entities/log.entity';

@Injectable()
export class SimulatorService {
    constructor(private readonly processService: ProcessService, private readonly scheduler: SchedulerService) { }

    init(input: CreateSimulationInput) {
        this.scheduler.reset()

        const { time, type, batchList } = input
        let i = 0
        const logs: Log[] = []

        for (const batch of batchList) {
            this.scheduler.reset(false)
            const processList = this.processService.setProcessList(batch.processList, type)
            this.scheduler.setSheduler({ type, quantum: input.quantum, processList })

            while (time ? i <= time : this.scheduler.numberOfCompletedProcesses() < processList.length) {
                const log = this.scheduler.clockEvent();
                if (batchList.length > 1)  log.batch = batch.id
                logs.push(log);
                if (time) i++;
            }
        }

        return logs
    }
}
