import { Injectable } from '@nestjs/common';
import { CreateSimulationInput } from './dto/create-simulation.input';
import { ProcessService } from '../process/process.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { Log } from '../scheduler/entities/log.entity';
import { CreateProcessInput } from '../process/dto/create-process.input';
import { CreateRandomSimulationInput } from './dto/create-random-simulation.input';
import { Batch } from './entities/Batch.interface';

@Injectable()
export class SimulatorService {
    constructor(private readonly processService: ProcessService, private readonly scheduler: SchedulerService) { }

    init(input: CreateSimulationInput) {
        this.scheduler.reset()

        const { time, type, enableBatchProcessing, processList, batchCount } = input
        let clock = 0
        const logs: Log[] = []

        let batchList: Batch[] = [{ id: 1, processList }]

        if (enableBatchProcessing && batchCount) batchList = createBatchList(processList, batchCount);

        for (const batch of batchList) {
            const batchProcessList = this.processService.setProcessList(batch.processList, type)
            this.scheduler.setSheduler({ type, quantum: input.quantum, processList: batchProcessList })
            const min = (batch.id - 1) * batchCount
            const max = min + batchCount
            let batchTime = enableBatchProcessing ? clock >= min && clock < max : true

            while (time ? clock <= time && batchTime : batchTime) {
                const log = this.scheduler.clockEvent();
                if (enableBatchProcessing) log.batch = batch.id
                logs.push(log);
                batchTime = enableBatchProcessing ? clock >= min && clock < max : true
                clock++;
            }
        }

        let endedProcess = 0;
        while (time ? clock < time : endedProcess < processList.length) {
            const log = this.scheduler.clockEvent();
            logs.push(log);
            clock++;
            endedProcess = log.endQueue.length
        }

        return logs
    }

    initRandom(input: CreateRandomSimulationInput) {
        const { processAmount, maxArrivalTime, maxBurstTime, minBurstTime, ...data } = input
        const processList: CreateProcessInput[] = []
        let id = 1
        for (let i = 0; i < processAmount; i++, id++) {
            const timeArrive = randomIntInRange(0, maxArrivalTime)
            const burstTime = randomIntInRange(minBurstTime, maxBurstTime)
            processList.push({ id, timeArrive, burstTime })
        }

        return this.init({ processList, ...data })
    }
}

const createBatchList = (processList: CreateProcessInput[], batchCount: number): Batch[] => {
    const batches: Batch[] = [];
    let batchId = 1;
    let amount = 0
    for (let i = 0; amount < processList.length; i += batchCount) {
        const { min, max } = { min: i, max: (i + batchCount) }
        let batchProcesses = [...processList.filter(process => process.timeArrive >= min && process.timeArrive < max)];
        batchProcesses = batchProcesses.map(process => {
            const { timeArrive, ...data } = process
            return {
                timeArrive: max,
                ...data
            }
        })
        batches.push({ id: batchId++, processList: batchProcesses });
        amount += batchProcesses.length
    }
    return batches;
};

function randomIntInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
