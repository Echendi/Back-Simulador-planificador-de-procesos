import { ProcessStatus } from "./process-status.enum";

export class Process {
    id: number
    burstTime: number
    remainingTime: number
    status: ProcessStatus
    timeArrive: number

    constructor(id: number, timeArrive: number, burstTime: number) {
        this.id = id
        this.burstTime = burstTime
        this.remainingTime = burstTime
        this.status = ProcessStatus.READY
        this.timeArrive = timeArrive
    }
}