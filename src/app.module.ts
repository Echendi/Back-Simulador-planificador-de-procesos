import { Module } from '@nestjs/common';
import { ProcessModule } from './process/process.module';
import { CpuModule } from './cpu/cpu.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SimulatorModule } from './simulator/simulator.module';

@Module({
  imports: [ProcessModule, CpuModule, SchedulerModule, SimulatorModule]
})
export class AppModule {}
