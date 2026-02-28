-- ============================================================
-- Baseline Migration: AudiologyLink initial schema
-- Covers: auth (custom) + education schemas
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Auth Schema (custom users + refresh tokens)
-- ─────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.auth_users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email   TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    roles   TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS auth.auth_refresh_tokens (
    user_id      UUID NOT NULL REFERENCES auth.auth_users(user_id) ON DELETE CASCADE,
    token_id     UUID NOT NULL,
    hashed_token TEXT NOT NULL,
    expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (user_id, token_id)
);

-- ─────────────────────────────────────────────────────────────
-- 2. Education Schema
-- ─────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS education;

-- Student Profiles
CREATE TABLE IF NOT EXISTS education.student_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.auth_users(user_id) ON DELETE CASCADE,
    university              TEXT NOT NULL,
    student_id_number       TEXT NOT NULL,
    verification_status     TEXT NOT NULL DEFAULT 'pending'
                              CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    subscription_status     TEXT NOT NULL DEFAULT 'inactive'
                              CHECK (subscription_status IN ('inactive', 'active', 'past_due')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id)
);

ALTER TABLE education.student_profiles ENABLE ROW LEVEL SECURITY;

-- Course Enrollments
CREATE TABLE IF NOT EXISTS education.course_enrollments (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id           UUID NOT NULL REFERENCES education.student_profiles(id) ON DELETE CASCADE,
    course_reference_id  TEXT NOT NULL,
    status               TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'completed', 'dropped')),
    progress_percentage  INTEGER NOT NULL DEFAULT 0,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (student_id, course_reference_id)
);

ALTER TABLE education.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Lesson Progress
CREATE TABLE IF NOT EXISTS education.lesson_progress (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id        UUID NOT NULL REFERENCES education.course_enrollments(id) ON DELETE CASCADE,
    lesson_reference_id  TEXT NOT NULL,
    status               TEXT NOT NULL DEFAULT 'not_started'
                           CHECK (status IN ('not_started', 'in_progress', 'completed')),
    last_accessed_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (enrollment_id, lesson_reference_id)
);

ALTER TABLE education.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS education.quiz_attempts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID NOT NULL REFERENCES education.student_profiles(id) ON DELETE CASCADE,
    quiz_reference_id   TEXT NOT NULL,
    score               INTEGER NOT NULL,
    passed              BOOLEAN NOT NULL,
    started_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    completed_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE education.quiz_attempts ENABLE ROW LEVEL SECURITY;
