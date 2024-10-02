import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProcessStatus } from './entities/process-status.enum';
import { Process } from './entities/process.entity';
import { SchedulerType } from '../scheduler/entities/escheduler-type.enum';
import { CreateProcessInput } from './dto/create-process.input';

@Injectable()
export class ProcessService {
    private processList: Process[];

    changeStatus(id: number, status: ProcessStatus) {
        const process = this.find(id)
        process.status = status
        return process
    }

    setProcessList(processList: CreateProcessInput[], type: SchedulerType) {
        this.processList = []
        for (const createprocessInput of processList) {
            this.processList.push(new Process(createprocessInput))
        }
        this.processList = this.sortProcessList(type)
        return this.processList
    }

    find(id: number) {
        const process = this.processList.find(process => process.id === id);
        if (!process) throw new NotFoundException(`No se encuentra proceso con id ${id}`)
        return process
    }

    findByArrivalTime(timeArrive: number) {
        return this.processList.filter(process => process.timeArrive === timeArrive);
    }

    getProcessList() {
        return this.processList
    }

    nextStep(timeJump: number, id: number) {
        const process = this.find(id)

        const { remainingTime } = process
        if (remainingTime < timeJump) process.remainingTime -= remainingTime
        process.remainingTime -= timeJump

        if (process.remainingTime === 0) process.status = ProcessStatus.ENDED
        return process
    }

    private sortProcessList(type: SchedulerType, isBatch: boolean = false) {
        switch (type) {
            case SchedulerType.FCFS:
            case SchedulerType.SRTF:
            case SchedulerType.RR:
                return this.processList.sort((p1, p2) => p1.timeArrive - p2.timeArrive)
            case SchedulerType.SJN:

                if (!isBatch) {
                    this.processList = this.processList.map(process => {
                        const { timeArrive, ...data } = process
                        return {
                            timeArrive: 0,
                            ...data
                        }
                    })
                }
                return this.processList.sort((p1, p2) => p1.burstTime - p2.burstTime)
            default:
                throw new InternalServerErrorException(`No se a establecido un algoritmo de planificación`)
        }
    }

}
