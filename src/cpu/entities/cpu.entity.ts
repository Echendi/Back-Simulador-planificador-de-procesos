import { Process } from "../../process/entities/process.entity"; 
import { CpuStatus } from "./cpu.status";

export class Cpu {
    runningProcess: Process; // Variable que almacena el proceso actualmente en ejecución en la CPU.
    status: CpuStatus; // Variable que indica el estado actual de la CPU (e.g. IDLE, BUSY).

    constructor() {
        this.status = CpuStatus.IDLE; // Inicializa la CPU en estado IDLE, indicando que no está ejecutando ningún proceso al inicio.
    }
}
