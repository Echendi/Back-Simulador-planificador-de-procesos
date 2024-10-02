import { CreateProcessInput } from "../../process/dto/create-process.input";

export interface Batch {
    id: number;
    processList: CreateProcessInput[];
}