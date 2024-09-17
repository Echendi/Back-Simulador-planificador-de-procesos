import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Process } from '../process/entities/process.entity';
import { ProcessService } from '../process/process.service';
import { ProcessStatus } from '../process/entities/process-status.enum';
import { CpuService } from '../cpu/cpu.service';
import { SchedulerType } from './entities/escheduler-type.enum';
import { CpuStatus } from '../cpu/entities/cpu.status';

@Injectable()
export class SchedulerService {
    private clock: number
    private jumpTime: number
    private type: SchedulerType
    private quantum: number
    private remainingQuantum: number
    private readyQueue: Process[]
    private endedQueue: Process[]

    constructor(
        private readonly processService: ProcessService,
        private readonly cpuService: CpuService,
    ) {
        this.readyQueue = []
        this.endedQueue = []
        this.clock = 0
        this.quantum = 0
        this.remainingQuantum = 0
    }

    setSheduler(options :{type: SchedulerType, quantum?: number, processList?: Process[]}) {
        const {type, quantum, processList} = options
        this.type = type
        if (quantum) this.quantum = quantum
        if (processList && type == SchedulerType.SJN) {
            const queue = processList.sort((p1, p2) => p1.burstTime - p2.burstTime)
            queue.map(process => this.toReady(process))
        }
    }

    toReady(process: Process) {
        process.status = ProcessStatus.READY
        this.readyQueue.push(process)
        console.log(`Ready P${process.id}`);
    }

    toEnded(process: Process) {
        process.status = ProcessStatus.ENDED
        this.endedQueue.push(process)
        this.cpuService.release()
        console.log(`End P${process.id}`);
        return this.toRunning()
    }

    toRunning() {
        const nextProcess = this.nextProcess()

        if (!nextProcess) {
            this.cpuService.release()
            return nextProcess
        }

        this.cpuService.assignProcess(nextProcess)
        if (this.type != SchedulerType.ROUND_ROBIN) this.quantum = nextProcess.burstTime
        this.remainingQuantum = this.quantum
        console.log(`Running P${nextProcess.id}`);

        return nextProcess
    }

    nextProcess() {
        switch (this.type) {
            case SchedulerType.FCFS:
            case SchedulerType.SJN:
            case SchedulerType.ROUND_ROBIN:
                return this.readyQueue.shift()
            case SchedulerType.SRTF:
                return this.nextProcessForSRTF();
            default:
                throw new InternalServerErrorException(`No se a establecido un algoritmo de planificación`)
        }
    }

    private nextProcessForSRTF() {
        const minBurstTime = Math.min(...this.readyQueue.map(item => item.burstTime));
        const minIndex = this.readyQueue.findIndex(item => item.burstTime === minBurstTime);
        return this.readyQueue.splice(minIndex, 1)[0];
    }

    clockEvent() {
        console.log(`Clock ${this.clock}`);
        if (this.type != SchedulerType.SJN) this.verifyNewProcess()

        if (this.cpuService.getStatus() == CpuStatus.IDLE) this.toRunning()
        let runningProcess = this.cpuService.getRunningProccess()
        if (runningProcess && runningProcess.remainingTime == 0) runningProcess = this.toEnded(runningProcess)

        if (runningProcess) {
            if (this.remainingQuantum == 0) {
                this.toReady(runningProcess)
                runningProcess = this.toRunning()
            }

            console.log('**************************************');
            console.log(`Running Process P${runningProcess.id}`);
            console.log("Proccess remainig time:", runningProcess.remainingTime)
            console.log("Remainig Quantum:", this.remainingQuantum)
            console.log('**************************************');

            runningProcess.remainingTime--
            this.remainingQuantum--
        }

        this.clock++
        console.log('-----------------------------------------------------------------');
    }

    verifyNewProcess() {
        const newProcess = this.processService.findByArrivalTime(this.clock)
        if (newProcess) this.toReady(newProcess)
    }

    nextClock() {
        this.clock += this.jumpTime
    }
}
