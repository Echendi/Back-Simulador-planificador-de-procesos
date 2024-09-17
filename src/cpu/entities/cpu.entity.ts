import { Process } from "../../process/entities/process.entity";
import { CpuStatus } from "./cpu.status";

export class Cpu {
    runningProcess: Process
    status: CpuStatus

    constructor() {
        this.status = CpuStatus.IDLE
    }
}