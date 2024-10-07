import { Injectable } from '@nestjs/common';
import { CreateSimulationInput } from './dto/create-simulation.input';
import { ProcessService } from '../process/process.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { Log } from '../scheduler/entities/log.entity';
import { CreateProcessInput } from '../process/dto/create-process.input';
import { CreateRandomSimulationInput } from './dto/create-random-simulation.input';
import { Batch } from './entities/Batch.interface';

@Injectable()
export class SimulatorService {
    // El servicio de simulador maneja la simulación de procesos según el algoritmo de planificación y gestiona los lotes.
    constructor(private readonly processService: ProcessService, private readonly scheduler: SchedulerService) { }

    // Inicializa una simulación basada en la entrada proporcionada.
    init(input: CreateSimulationInput) {
        this.scheduler.reset(); // Resetea los estados previos de la simulación y del scheduler.

        const { time, type, enableBatchProcessing, processList, batchCount } = input;
        let clock = 0;
        const logs: Log[] = [];

        // Inicializa una lista de lotes de procesos, en caso de que esté habilitado el procesamiento por lotes.
        let batchList: Batch[] = [{ id: 1, processList }];

        if (enableBatchProcessing && batchCount) batchList = createBatchList(processList, batchCount);

        // Itera sobre cada lote de procesos.
        for (const batch of batchList) {
            const batchProcessList = this.processService.setProcessList(batch.processList, type);
            this.scheduler.setSheduler({ type, quantum: input.quantum, processList: batchProcessList });
            const min = (batch.id - 1) * batchCount;
            const max = min + batchCount;
            let batchTime = enableBatchProcessing ? clock >= min && clock < max : true;

            // Ejecuta eventos de reloj mientras la simulación esté en curso.
            while (time ? clock <= time && batchTime : batchTime) {
                const log = this.scheduler.clockEvent();
                if (enableBatchProcessing) log.batch = batch.id;
                logs.push(log);
                batchTime = enableBatchProcessing ? clock >= min && clock < max : true;
                clock++;
            }
        }

        let endedProcess = 0;
        // Maneja la finalización de procesos fuera del procesamiento por lotes o límite de tiempo.
        while (time ? clock < time : endedProcess < processList.length) {
            const log = this.scheduler.clockEvent();
            logs.push(log);
            clock++;
            endedProcess = log.endQueue.length;
        }

        return logs; // Devuelve los logs de la simulación.
    }

    // Inicializa una simulación aleatoria con procesos generados aleatoriamente.
    initRandom(input: CreateRandomSimulationInput) {
        const { processAmount, maxArrivalTime, maxBurstTime, minBurstTime, ...data } = input;
        const processList: CreateProcessInput[] = [];
        let id = 1;
        // Genera una lista de procesos con tiempos de llegada y ráfagas de tiempo aleatorias.
        for (let i = 0; i < processAmount; i++, id++) {
            const timeArrive = randomIntInRange(0, maxArrivalTime);
            const burstTime = randomIntInRange(minBurstTime, maxBurstTime);
            processList.push({ id, timeArrive, burstTime });
        }

        return this.init({ processList, ...data }); // Inicia la simulación con los procesos generados.
    }
}

// Crea una lista de lotes de procesos a partir de la lista de procesos y el tamaño del lote.
const createBatchList = (processList: CreateProcessInput[], batchCount: number): Batch[] => {
    const batches: Batch[] = [];
    let batchId = 1;
    let amount = 0;
    // Divide los procesos en lotes basados en el tiempo de llegada.
    for (let i = 0; amount < processList.length; i += batchCount) {
        const { min, max } = { min: i, max: (i + batchCount) };
        let batchProcesses = [...processList.filter(process => process.timeArrive >= min && process.timeArrive < max)];
        // Ajusta el tiempo de llegada de los procesos en el lote.
        batchProcesses = batchProcesses.map(process => {
            const { timeArrive, ...data } = process;
            return {
                timeArrive: max,
                ...data,
            };
        });
        batches.push({ id: batchId++, processList: batchProcesses });
        amount += batchProcesses.length;
    }
    return batches; // Devuelve la lista de lotes.
};

// Función auxiliar para generar un número aleatorio entre un rango dado.
function randomIntInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
