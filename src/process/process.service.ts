import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProcessStatus } from './entities/process-status.enum';
import { Process } from './entities/process.entity';
import { SchedulerType } from '../scheduler/entities/escheduler-type.enum';

@Injectable()
export class ProcessService {
    private processList: Process[];

    changeStatus(id: number, status: ProcessStatus) {
        const process = this.find(id)
        process.status = status
        return process
    }

    setProcessList(processList: Process[]){
        this.processList = processList
    }

    find(id: number) {
        const process = this.processList.find(process => process.id === id);
        if (!process) throw new NotFoundException(`No se encuentra proceso con id ${id}`)
        return process
    }

    findByArrivalTime(timeArrive: number) {
        return this.processList.find(process => process.timeArrive === timeArrive);
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

    sortProcessList(type: SchedulerType) {
        switch (type) {
            case SchedulerType.FCFS:
            case SchedulerType.SRTF:
            case SchedulerType.ROUND_ROBIN:
                return this.processList.sort((p1, p2) => p1.timeArrive - p2.timeArrive)
            case SchedulerType.SJN:
                return this.processList.sort((p1, p2) => p1.burstTime - p2.burstTime)
            default:
                throw new InternalServerErrorException(`No se a establecido un algoritmo de planificación`)
        }
    }

}
