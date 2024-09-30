import { CpuStatus } from "../../cpu/entities/cpu.status"
import { Process } from "../../process/entities/process.entity"

export class Log {
    clock: number
    cpuStatus: CpuStatus
    readyQueue: Process[] = []
    endQueue: Process[] = []
    toReadyProcess?: Process[] = []
    toRunningProcess?: Process
    toEndedProcess?: Process
    runningProcess?: Process
    batch?: number
}