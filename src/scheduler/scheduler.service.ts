import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Process } from '../process/entities/process.entity'
import { ProcessService } from '../process/process.service'
import { ProcessStatus } from '../process/entities/process-status.enum'
import { CpuService } from '../cpu/cpu.service'
import { SchedulerType } from './entities/escheduler-type.enum'
import { CpuStatus } from '../cpu/entities/cpu.status'
import { Log } from './entities/log.entity'

@Injectable()
export class SchedulerService {
    private clock: number
    private jumpTime: number
    private type: SchedulerType
    private quantum: number
    private remainingQuantum: number
    private readyQueue: Process[]
    private endedQueue: Process[]
    currentLog: Log

    constructor(
        private readonly processService: ProcessService,
        private readonly cpuService: CpuService,
    ) { }

    reset(resetlock: boolean = true) {
        this.readyQueue = []
        this.endedQueue = []
        this.remainingQuantum = this.quantum
        if (resetlock) this.clock = 0
    }

    setSheduler(options: { type: SchedulerType, quantum?: number, processList?: Process[] }) {
        this.currentLog = new Log()
        const { type, quantum, processList } = options
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
        this.currentLog.toReadyProcess.push({ ...process })
    }

    toEnded(process: Process) {
        process.status = ProcessStatus.ENDED
        this.endedQueue.push(process)
        this.cpuService.release()

        process.completionTime = this.clock
        process.turnaroundTime = process.completionTime - process.timeArrive
        process.waitingTime = process.turnaroundTime - process.burstTime
        process.normalizedTurnaroundTime = process.turnaroundTime / process.burstTime

        this.currentLog.toEndedProcess = { ...process }
    }

    toRunning() {
        const nextProcess = this.nextProcess()

        if (!nextProcess) {
            this.cpuService.release()
            return nextProcess
        }

        this.cpuService.assignProcess(nextProcess)
        if (this.type != SchedulerType.RR) this.quantum = nextProcess.burstTime
        this.remainingQuantum = this.quantum

        this.currentLog.toRunningProcess = { ...nextProcess }
        return nextProcess
    }

    nextProcess() {
        switch (this.type) {
            case SchedulerType.FCFS:
            case SchedulerType.SJN:
            case SchedulerType.RR:
                return this.readyQueue.shift()
            case SchedulerType.SRTF:
                return this.nextProcessForSRTF()
            default:
                throw new InternalServerErrorException(`No se a establecido un algoritmo de planificación`)
        }
    }

    private nextProcessForSRTF() {
        const minBurstTime = Math.min(...this.readyQueue.map(item => item.burstTime))
        const minIndex = this.readyQueue.findIndex(item => item.burstTime === minBurstTime)
        return this.readyQueue.splice(minIndex, 1)[0]
    }

    clockEvent() {
        if (this.type != SchedulerType.SJN) this.verifyNewProcess()

        if (this.cpuService.getStatus() == CpuStatus.IDLE) this.toRunning()
        let runningProcess = this.cpuService.getRunningProccess()

        if (runningProcess && runningProcess.remainingTime == 0) {
            this.toEnded(runningProcess)
            runningProcess = this.toRunning()
        }

        if (runningProcess) {
            if (this.remainingQuantum == 0) {
                this.toReady(runningProcess)
                runningProcess = this.toRunning()
            }

            this.currentLog.runningProcess = { ...runningProcess }

            runningProcess.remainingTime--
            this.remainingQuantum--
        }

        this.currentLog.clock = this.clock
        this.currentLog.cpuStatus = this.cpuService.getStatus()
        this.currentLog.endQueue = JSON.parse(JSON.stringify(this.endedQueue))
        this.currentLog.readyQueue = JSON.parse(JSON.stringify(this.readyQueue))

        this.clock++
        return this.resetLog()
    }

    resetLog() {
        const saveLog = { ...this.currentLog }
        this.currentLog = new Log()
        return saveLog
    }

    verifyNewProcess() {
        const newProcessList = this.processService.findByArrivalTime(this.clock)
        if (newProcessList) newProcessList.map((newProcess) => this.toReady(newProcess))
    }

    nextClock() {
        this.clock += this.jumpTime
    }

    numberOfCompletedProcesses() {
        return this.endedQueue.length
    }
}
