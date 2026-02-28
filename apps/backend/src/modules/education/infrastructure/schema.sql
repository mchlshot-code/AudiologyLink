-- Education Module Schema
-- RLS MUST be enabled on every table.

CREATE SCHEMA IF NOT EXISTS education;

-- 1. Student Profile
CREATE TABLE education.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    university TEXT NOT NULL,
    student_id_number TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'past_due')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

ALTER TABLE education.student_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own profile.
CREATE POLICY "Users can view own profile" 
ON education.student_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own profile registration.
CREATE POLICY "Users can insert own profile" 
ON education.student_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Wait, the backend NestJS service uses the service_role key to bypass RLS, OR it impersonates the user.
-- According to Agent.md: "Service role key is used ONLY in the NestJS backend ... Anon key is NEVER used — all access goes through the backend". This implies the backend uses the service_role key, or it passes the user token. If it passes the service_role key, then RLS doesn't block the backend, but RLS must still exist for safety.
-- Let's make sure the backend can access everything (it usually does if it uses service_role).


-- 2. Course Enrollment
CREATE TABLE education.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES education.student_profiles(id) ON DELETE CASCADE,
    course_reference_id TEXT NOT NULL, -- Matches Strapi course ID/slug
    status TEXT NOT NULL text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, course_reference_id)
);

ALTER TABLE education.course_enrollments ENABLE ROW LEVEL SECURITY;

-- 3. Lesson Progress
CREATE TABLE education.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES education.course_enrollments(id) ON DELETE CASCADE,
    lesson_reference_id TEXT NOT NULL, -- Matches Strapi lesson ID/slug
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(enrollment_id, lesson_reference_id)
);

ALTER TABLE education.lesson_progress ENABLE ROW LEVEL SECURITY;

-- 4. Quiz Attempt
CREATE TABLE education.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES education.student_profiles(id) ON DELETE CASCADE,
    quiz_reference_id TEXT NOT NULL, -- Matches Strapi quiz ID/slug
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE education.quiz_attempts ENABLE ROW LEVEL SECURITY;
