import { CreateProcessInput } from "../dto/create-process.input";
import { ProcessStatus } from "./process-status.enum";

export class Process {
    id: number
    burstTime: number
    remainingTime: number
    status: ProcessStatus
    timeArrive: number
    completionTime?: number
    turnaroundTime?: number
    waitingTime?: number
    normalizedTurnaroundTime?: number

    constructor(input: CreateProcessInput) {
        const { id, burstTime, timeArrive } = input
        this.id = id
        this.burstTime = burstTime
        this.remainingTime = burstTime
        this.status = ProcessStatus.READY
        this.timeArrive = timeArrive
    }
}