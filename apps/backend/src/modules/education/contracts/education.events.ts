/**
 * Education Module — Integration Events
 *
 * These events form the public contract for cross-module communication.
 * Other modules subscribe to these via the event bus.
 * See Agent.md §20 for the required event list.
 */

/** Emitted when an admin verifies (approves/rejects) a student */
export class StudentVerifiedEvent {
    constructor(
        public readonly userId: string,
        public readonly verificationStatus: 'verified' | 'rejected',
        public readonly verifiedAt: Date,
    ) { }
}

/** Emitted when a student successfully enrols in a course */
export class StudentEnrolledEvent {
    constructor(
        public readonly studentId: string,
        public readonly courseReferenceId: string,
        public readonly enrolledAt: Date,
    ) { }
}

/** Emitted when a student submits a quiz attempt */
export class QuizAttemptCompletedEvent {
    constructor(
        public readonly studentId: string,
        public readonly quizReferenceId: string,
        public readonly score: number,
        public readonly passed: boolean,
        public readonly attemptedAt: Date,
    ) { }
}
