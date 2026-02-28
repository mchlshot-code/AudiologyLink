import type { StudentProfileDto } from '../contracts/education.dto';

export const STUDENT_PROFILE_REPOSITORY = Symbol('STUDENT_PROFILE_REPOSITORY');

export interface StudentProfileRepository {
    findByUserId(userId: string): Promise<StudentProfileDto | null>;
    createProfile(profile: Omit<StudentProfileDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudentProfileDto>;
    updateVerificationStatus(userId: string, status: 'verified' | 'rejected'): Promise<StudentProfileDto | null>;
}
