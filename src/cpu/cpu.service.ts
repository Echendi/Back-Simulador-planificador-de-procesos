import { Injectable } from '@nestjs/common';
import { Process } from '../process/entities/process.entity';
import { Cpu } from './entities/cpu.entity';
import { CpuStatus } from './entities/cpu.status';
import { ProcessService } from '../process/process.service';
import { ProcessStatus } from '../process/entities/process-status.enum';

@Injectable()
export class CpuService {
    private cpu: Cpu

    constructor(private readonly processService: ProcessService) {
        this.cpu = new Cpu()
    }

    assignProcess(processId: number) {
        const process = this.processService.changeStatus(processId, ProcessStatus.RUNNING)
        this.cpu.runningProcess = process
        this.cpu.status = CpuStatus.BUSY
    }

    release() {
        this.cpu.runningProcess = undefined
        this.cpu.status = CpuStatus.IDLE
    }

    getRunningProccess() {
        return this.cpu.runningProcess
    }

    getStatus() {
        return this.cpu.status
    }
}
