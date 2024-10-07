import { CpuStatus } from "../../cpu/entities/cpu.status"
import { Process } from "../../process/entities/process.entity"

//Permite registrar el estado de la simulación en cada "tick" del reloj para analizar el comportamiento de los procesos y la CPU
export class Log {
    clock: number; // Representa el valor actual del reloj del sistema (tiempo del simulador).
    cpuStatus: CpuStatus; // Almacena el estado actual de la CPU (IDLE o BUSY).
    readyQueue: Process[] = []; // Cola de procesos listos para ser ejecutados.
    endQueue: Process[] = []; // Cola de procesos que ya han terminado su ejecución.
    remainingQuantum: number; // Tiempo restante del quantum para el algoritmo Round Robin.
    toReadyProcess?: Process[] = []; // Procesos que están pasando a la cola de listos en el ciclo actual.
    toRunningProcess?: Process; // Proceso que pasa al estado de ejecución en este ciclo.
    toEndedProcess?: Process; // Proceso que ha finalizado su ejecución en este ciclo.
    runningProcess?: Process; // Proceso actualmente en ejecución.
    batch?: number; // Número de lote, útil en sistemas de planificación por lotes (batch processing).
}
