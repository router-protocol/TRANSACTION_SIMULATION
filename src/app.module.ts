import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { AnvilManagerService } from './anvil-manager/anvil-manager.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, AnvilManagerService],
})
export class AppModule {}
