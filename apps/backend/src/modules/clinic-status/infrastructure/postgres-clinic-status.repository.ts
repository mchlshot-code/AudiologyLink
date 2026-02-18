import { Pool, type PoolConfig } from 'pg';
import { ClinicStatusDto } from '../contracts/clinic-status.dto';
import { ClinicStatusRepository } from '../domain/clinic-status.repository';

const getSchemaName = (value: string) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error('Invalid schema name');
  }
  return value;
};

export class PostgresClinicStatusRepository implements ClinicStatusRepository {
  private readonly pool: Pool;
  private readonly schema: string;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    this.schema = getSchemaName(process.env.CLINIC_STATUS_SCHEMA ?? 'clinic');
    const poolConfig: PoolConfig = {
      connectionString,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    };
    this.pool = new Pool(poolConfig);
  }

  async getCurrentStatus(): Promise<ClinicStatusDto> {
    const result = await this.pool.query<ClinicStatusDto>(
      `select clinic_id as "clinicId", name, status, updated_at as "updatedAt"
       from ${this.schema}.clinic_status
       order by updated_at desc
       limit 1`,
    );

    if (result.rows[0]) {
      return result.rows[0];
    }

    return {
      clinicId: 'unknown',
      name: 'Unknown Clinic',
      status: 'closed',
      updatedAt: new Date().toISOString(),
    };
  }
}
