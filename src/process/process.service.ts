import { Injectable, NotFoundException } from '@nestjs/common';
import { ProcessStatus } from './entities/process-status.enum';
import { Process } from './entities/process.entity';

@Injectable()
export class ProcessService {
    processList: Process[];

    changeStatus(id: number, status: ProcessStatus) {
        const process = this.find(id)
        process.status = status
        return process
    }

    private find(id: number) {
        const process = this.processList.find(process => process.id === id);
        if (!process) throw new NotFoundException(`No se encuentra proceso con id ${id}`)
        return process
    }

    nextStep(timeJump: number, id: number) {
        const process = this.find(id)

        const { remainingTime } = process
        if (remainingTime < timeJump) process.remainingTime -= remainingTime
        process.remainingTime -= timeJump

        if (process.remainingTime === 0) process.status = ProcessStatus.ENDED
        return process
    }
}
