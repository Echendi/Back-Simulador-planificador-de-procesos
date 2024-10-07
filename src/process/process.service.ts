import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProcessStatus } from './entities/process-status.enum';
import { Process } from './entities/process.entity';
import { SchedulerType } from '../scheduler/entities/escheduler-type.enum';
import { CreateProcessInput } from './dto/create-process.input';

@Injectable()
export class ProcessService {
    private processList: Process[]; // Lista de procesos que maneja el servicio.

    // Cambia el estado de un proceso específico.
    changeStatus(id: number, status: ProcessStatus) {
        const process = this.find(id); // Busca el proceso por su id.
        process.status = status; // Cambia el estado del proceso.
        return process; // Retorna el proceso modificado.
    }

    // Establece una lista de procesos y la ordena según el tipo de planificación.
    setProcessList(processList: CreateProcessInput[], type: SchedulerType) {
        this.processList = []; // Inicializa la lista de procesos.
        for (const createProcessInput of processList) {
            this.processList.push(new Process(createProcessInput)); // Crea y añade procesos a la lista.
        }
        this.processList = this.sortProcessList(type); // Ordena la lista según el tipo de planificador.
        return this.processList; // Retorna la lista de procesos.
    }

    // Busca un proceso por su id, si no lo encuentra lanza una excepción.
    find(id: number) {
        const process = this.processList.find(process => process.id === id);
        if (!process) throw new NotFoundException(`No se encuentra proceso con id ${id}`);
        return process;
    }

    // Busca procesos que coincidan con un tiempo de llegada específico.
    findByArrivalTime(timeArrive: number) {
        return this.processList.filter(process => process.timeArrive === timeArrive);
    }

    // Retorna la lista actual de procesos.
    getProcessList() {
        return this.processList;
    }

    // Realiza el siguiente paso en la ejecución de un proceso, según el tiempo de salto.
    nextStep(timeJump: number, id: number) {
        const process = this.find(id); // Encuentra el proceso por id.

        const { remainingTime } = process; // Obtiene el tiempo restante del proceso.
        if (remainingTime < timeJump) process.remainingTime -= remainingTime; // Si el tiempo de salto es mayor al tiempo restante, ajusta el tiempo.
        process.remainingTime -= timeJump; // Resta el tiempo de salto al tiempo restante.

        if (process.remainingTime === 0) process.status = ProcessStatus.ENDED; // Si el tiempo restante llega a cero, marca el proceso como terminado.
        return process; // Retorna el proceso actualizado.
    }

    // Ordena la lista de procesos según el tipo de algoritmo de planificación.
    private sortProcessList(type: SchedulerType, isBatch: boolean = false) {
        switch (type) {
            case SchedulerType.FCFS: // First-Come, First-Served (primero en llegar, primero en ser servido).
            case SchedulerType.SRTF: // Shortest Remaining Time First (primero el tiempo restante más corto).
            case SchedulerType.RR:   // Round Robin (turnos por tiempo).
                return this.processList.sort((p1, p2) => p1.timeArrive - p2.timeArrive); // Ordena por tiempo de llegada.
            case SchedulerType.SJN:   // Shortest Job Next (el proceso con menor duración de trabajo va primero).
                if (!isBatch) {
                    // Si no es por lotes, ajusta el tiempo de llegada a 0 para priorizar el tiempo de ráfaga.
                    this.processList = this.processList.map(process => {
                        const { timeArrive, ...data } = process;
                        return {
                            timeArrive: 0,
                            ...data
                        };
                    });
                }
                return this.processList.sort((p1, p2) => p1.burstTime - p2.burstTime); // Ordena por tiempo de ráfaga.
            default:
                throw new InternalServerErrorException(`No se ha establecido un algoritmo de planificación`); // Lanza un error si no se especifica un tipo válido.
        }
    }

}
