import { CreateProcessInput } from "../../process/dto/create-process.input";

// La interfaz `Batch` define un conjunto de procesos agrupados en un lote.
export interface Batch {
    id: number; // Identificador único para el lote.
    processList: CreateProcessInput[]; // Lista de procesos que pertenecen al lote, definida como un array de `CreateProcessInput`.
}
