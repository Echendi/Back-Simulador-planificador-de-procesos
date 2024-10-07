export enum SchedulerType {
    FCFS = 'FCFS', // First-Come, First-Served: Procesos se ejecutan en el orden en que llegan.
    SJN = 'SJN',   // Shortest Job Next: El proceso con el menor tiempo de ejecución (burst time) es el siguiente en ejecutarse.
    SRTF = 'SRTF', // Shortest Remaining Time First: El proceso con el menor tiempo restante se ejecuta primero.
    RR = 'RR'      // Round Robin: Los procesos se ejecutan en turnos por tiempo (quantum), de forma cíclica.
}
