export class RegisterStudentRequestDto {
    university: string;
    studentIdNumber: string;
}

export class VerifyStudentRequestDto {
    verificationStatus: 'verified' | 'rejected';
}

export interface StudentProfileDto {
    id: string;
    userId: string;
    university: string;
    studentIdNumber: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    subscriptionStatus: 'inactive' | 'active' | 'past_due';
    subscriptionExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
