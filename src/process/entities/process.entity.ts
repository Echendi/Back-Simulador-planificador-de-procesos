import { ProcessStatus } from "./process-status.enum";

export class Process {
    id: number
    burstTime: number
    remainingTime: number
    status: ProcessStatus

    constructor(burstTime: number) {
        this.burstTime = burstTime
        this.remainingTime = burstTime
        this.status = ProcessStatus.READY
    }
}