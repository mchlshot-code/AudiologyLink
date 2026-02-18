import { Controller, Get } from '@nestjs/common';
import { GetClinicStatusHandler } from './handler';

@Controller('api/clinic-status')
export class GetClinicStatusEndpoint {
  constructor(private readonly handler: GetClinicStatusHandler) {}

  @Get()
  async handle() {
    return this.handler.execute();
  }
}
