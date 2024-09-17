import { Module } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { SimulatorController } from './simulator.controller';
import { ProcessModule } from '../process/process.module';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  providers: [SimulatorService],
  controllers: [SimulatorController],
  imports: [ProcessModule, SchedulerModule]
})
export class SimulatorModule {}
