import { Module } from '@nestjs/common';
import { CpuService } from './cpu.service';
import { ProcessModule } from '../process/process.module';

@Module({
  providers: [CpuService],
  imports: [ProcessModule]
})
export class CpuModule {}
