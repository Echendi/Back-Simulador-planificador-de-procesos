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
    private clock: number; // Valor actual del reloj del simulador.
    private type: SchedulerType; // Tipo de planificador (FCFS, SJN, etc.).
    private quantum: number; // Quantum para Round Robin.
    private remainingQuantum: number; // Quantum restante para el proceso actual.
    private readyQueue: Process[]; // Cola de procesos listos para ejecución.
    private endedQueue: Process[]; // Cola de procesos que han finalizado.
    currentLog: Log; // Registro del estado actual del simulador.

    constructor(
        private readonly processService: ProcessService, // Servicio que gestiona los procesos.
        private readonly cpuService: CpuService, // Servicio que gestiona la CPU.
    ) {}

    // Restablece el simulador a su estado inicial.
    reset() {
        this.readyQueue = [];
        this.endedQueue = [];
        this.remainingQuantum = this.quantum;
        this.clock = 0;
        this.cpuService.release(); // Libera la CPU, poniendo su estado en IDLE.
    }

    // Configura el planificador con opciones como tipo, quantum y lista de procesos.
    setSheduler(options: { type: SchedulerType, quantum?: number, processList?: Process[] }) {
        this.currentLog = new Log(); // Inicializa un nuevo registro de log.
        const { type, quantum, processList } = options;
        this.type = type;
        if (quantum) this.quantum = quantum;
        if (processList && type == SchedulerType.SJN) {
            // Ordena la lista de procesos según el tiempo de burst en el caso de SJN.
            const queue = processList.sort((p1, p2) => p1.burstTime - p2.burstTime);
            queue.map(process => this.toReady(process)); // Mueve cada proceso a la cola de listos.
        }
    }

    // Mueve un proceso a la cola de listos.
    toReady(process: Process) {
        process.status = ProcessStatus.READY; // Cambia el estado del proceso a READY.
        this.readyQueue.push(process); // Añade el proceso a la cola de listos.
        this.currentLog.toReadyProcess.push({ ...process }); // Registra el proceso en el log.
    }

    // Mueve un proceso a la cola de terminados.
    toEnded(process: Process) {
        process.status = ProcessStatus.ENDED; // Cambia el estado del proceso a ENDED.
        this.endedQueue.push(process); // Añade el proceso a la cola de terminados.
        this.cpuService.release(); // Libera la CPU al terminar el proceso.

        // Calcula métricas como turnaround, waiting time, y normalized turnaround.
        process.completionTime = this.clock;
        process.turnaroundTime = process.completionTime - process.timeArrive;
        process.waitingTime = process.turnaroundTime - process.burstTime;
        process.normalizedTurnaroundTime = process.turnaroundTime / process.burstTime;

        this.currentLog.toEndedProcess = { ...process }; // Registra el proceso terminado en el log.
    }

    // Cambia un proceso al estado de ejecución.
    toRunning() {
        const nextProcess = this.nextProcess(); // Obtiene el siguiente proceso para ejecutar.

        if (!nextProcess) {
            this.cpuService.release(); // Libera la CPU si no hay más procesos.
            return nextProcess;
        }

        this.cpuService.assignProcess(nextProcess); // Asigna el proceso a la CPU.
        if (this.type != SchedulerType.RR) this.quantum = nextProcess.burstTime; // Ajusta el quantum si no es Round Robin.
        this.remainingQuantum = this.quantum; // Restaura el quantum restante.

        this.currentLog.toRunningProcess = { ...nextProcess }; // Registra el proceso en ejecución en el log.
        return nextProcess;
    }

    // Obtiene el siguiente proceso a ejecutar según el tipo de planificador.
    nextProcess() {
        switch (this.type) {
            case SchedulerType.FCFS:
            case SchedulerType.SJN:
            case SchedulerType.RR:
                return this.readyQueue.shift(); // Obtiene el primer proceso en la cola de listos.
            case SchedulerType.SRTF:
                return this.nextProcessForSRTF(); // Obtiene el proceso con el menor tiempo restante (SRTF).
            default:
                throw new InternalServerErrorException(`No se ha establecido un algoritmo de planificación`);
        }
    }

    // Lógica para el algoritmo SRTF (Shortest Remaining Time First).
    private nextProcessForSRTF() {
        const minBurstTime = Math.min(...this.readyQueue.map(item => item.burstTime)); // Encuentra el menor tiempo de ráfaga.
        const minIndex = this.readyQueue.findIndex(item => item.burstTime === minBurstTime); // Encuentra el índice del proceso con menor ráfaga.
        return this.readyQueue.splice(minIndex, 1)[0]; // Remueve y retorna ese proceso de la cola.
    }

    // Evento del reloj que avanza la simulación un paso.
    clockEvent() {
        this.currentLog.remainingQuantum = this.remainingQuantum; // Actualiza el quantum restante en el log.

        if (this.type != SchedulerType.SJN) this.verifyNewProcess(); // Verifica si hay nuevos procesos que han llegado.

        if (this.cpuService.getStatus() == CpuStatus.IDLE) this.toRunning(); // Asigna un proceso si la CPU está inactiva.
        let runningProcess = this.cpuService.getRunningProccess(); // Obtiene el proceso en ejecución.

        if (runningProcess && runningProcess.remainingTime == 0) {
            this.toEnded(runningProcess); // Termina el proceso si su tiempo restante es 0.
            runningProcess = this.toRunning(); // Asigna un nuevo proceso a la CPU.
        }

        if (runningProcess) {
            if (this.remainingQuantum == 0) {
                this.toReady(runningProcess); // Vuelve a poner el proceso en la cola de listos si se acaba el quantum.
                runningProcess = this.toRunning(); // Asigna un nuevo proceso.
            }

            this.currentLog.runningProcess = { ...runningProcess }; // Registra el proceso en ejecución.

            runningProcess.remainingTime--; // Reduce el tiempo restante del proceso.
            this.remainingQuantum--; // Reduce el quantum restante.
        }

        // Actualiza el estado del log con la información del ciclo actual.
        this.currentLog.clock = this.clock;
        this.currentLog.cpuStatus = this.cpuService.getStatus();
        this.currentLog.endQueue = JSON.parse(JSON.stringify(this.endedQueue));
        this.currentLog.readyQueue = JSON.parse(JSON.stringify(this.readyQueue));

        this.clock++; // Avanza el reloj.
        return this.resetLog(); // Retorna el log actual y lo reinicia.
    }

    // Reinicia el log al final del ciclo.
    resetLog() {
        const saveLog = { ...this.currentLog }; // Guarda una copia del log actual.
        this.currentLog = new Log(); // Reinicia el log.
        return saveLog; // Retorna el log guardado.
    }

    // Verifica si hay nuevos procesos que han llegado en el ciclo actual.
    verifyNewProcess() {
        const newProcessList = this.processService.findByArrivalTime(this.clock); // Busca procesos por su tiempo de llegada.
        if (newProcessList) newProcessList.map((newProcess) => this.toReady(newProcess)); // Añade los nuevos procesos a la cola de listos.
    }

    // Retorna el número de procesos completados.
    numberOfCompletedProcesses() {
        return this.endedQueue.length;
    }
}
