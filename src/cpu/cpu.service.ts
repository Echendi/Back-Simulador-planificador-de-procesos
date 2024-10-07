import { Injectable } from '@nestjs/common';
import { Process } from '../process/entities/process.entity';
import { Cpu } from './entities/cpu.entity';
import { CpuStatus } from './entities/cpu.status';
import { ProcessService } from '../process/process.service';
import { ProcessStatus } from '../process/entities/process-status.enum';

@Injectable()
export class CpuService {
    private cpu: Cpu; // Variable privada que mantiene una instancia de la CPU.

    constructor(private readonly processService: ProcessService) {
        this.cpu = new Cpu(); // Inicializa la CPU en el constructor del servicio.
    }

    // Método para asignar un proceso a la CPU.
    assignProcess(process: Process) {
        process.status = ProcessStatus.RUNNING; // Cambia el estado del proceso a RUNNING (en ejecución).
        this.cpu.runningProcess = process; // Asigna el proceso a la CPU.
        this.cpu.status = CpuStatus.BUSY; // Cambia el estado de la CPU a BUSY (ocupada).
    }

    // Método para liberar la CPU (cuando termina la ejecución de un proceso).
    release() {
        this.cpu.runningProcess = undefined; // Libera el proceso actualmente en ejecución.
        this.cpu.status = CpuStatus.IDLE; // Cambia el estado de la CPU a IDLE (inactiva).
    }

    // Método para obtener el proceso actualmente en ejecución en la CPU.
    getRunningProccess() {
        return this.cpu.runningProcess; // Devuelve el proceso en ejecución o undefined si no hay ninguno.
    }

    // Método para obtener el estado actual de la CPU.
    getStatus() {
        return this.cpu.status; // Devuelve el estado actual de la CPU (BUSY o IDLE).
    }
}