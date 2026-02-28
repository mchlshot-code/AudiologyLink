import { Pool, type PoolConfig } from 'pg';
import type { StudentProfileRepository } from '../domain/student-profile.repository';
import type { StudentProfileDto } from '../contracts/education.dto';

export class PostgresStudentProfileRepository implements StudentProfileRepository {
    private readonly pool: Pool;
    private readonly schema = 'education';

    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL is not set');
        }

        const poolConfig: PoolConfig = {
            connectionString,
            ssl:
                process.env.DATABASE_SSL === 'true'
                    ? { rejectUnauthorized: false }
                    : undefined,
        };
        this.pool = new Pool(poolConfig);
    }

    async findByUserId(userId: string): Promise<StudentProfileDto | null> {
        const result = await this.pool.query<any>(
            `select id, user_id as "userId", university, student_id_number as "studentIdNumber", 
              verification_status as "verificationStatus", subscription_status as "subscriptionStatus", 
              subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt", updated_at as "updatedAt"
       from ${this.schema}.student_profiles
       where user_id = $1
       limit 1`,
            [userId],
        );

        return result.rows[0] ?? null;
    }

    async createProfile(profile: Omit<StudentProfileDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudentProfileDto> {
        const result = await this.pool.query<any>(
            `insert into ${this.schema}.student_profiles 
        (user_id, university, student_id_number, verification_status, subscription_status, subscription_expires_at)
       values ($1, $2, $3, $4, $5, $6)
       returning id, user_id as "userId", university, student_id_number as "studentIdNumber", 
                 verification_status as "verificationStatus", subscription_status as "subscriptionStatus", 
                 subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt", updated_at as "updatedAt"`,
            [profile.userId, profile.university, profile.studentIdNumber, profile.verificationStatus, profile.subscriptionStatus, profile.subscriptionExpiresAt],
        );

        return result.rows[0];
    }

    async updateVerificationStatus(userId: string, status: 'verified' | 'rejected'): Promise<StudentProfileDto | null> {
        const result = await this.pool.query<any>(
            `update ${this.schema}.student_profiles
       set verification_status = $2, updated_at = timezone('utc'::text, now())
       where user_id = $1
       returning id, user_id as "userId", university, student_id_number as "studentIdNumber", 
                 verification_status as "verificationStatus", subscription_status as "subscriptionStatus", 
                 subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt", updated_at as "updatedAt"`,
            [userId, status],
        );

        return result.rows[0] ?? null;
    }
}
