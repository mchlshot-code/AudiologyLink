import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('ClinicStatus (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/clinic-status (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/clinic-status')
      .expect(200)
      .expect((response) => {
        const body = response.body as { clinicId?: unknown };
        if (typeof body.clinicId !== 'string') {
          throw new Error('Missing clinicId');
        }
      });
  });
});
