import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ProcessModule } from '../process/process.module';
import { CpuModule } from '../cpu/cpu.module';

@Module({
  providers: [SchedulerService],
  imports: [ProcessModule, CpuModule],
  exports: [SchedulerService]
})
export class SchedulerModule { }
