-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- --------------------------------------------------------
-- 1. Identity & Access Management (IAM)
-- --------------------------------------------------------
CREATE TYPE user_role AS ENUM ('student', 'tutor', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mapping Tutors (More Knowledgeable Other) to Students
CREATE TABLE student_tutor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, tutor_id)
);

-- --------------------------------------------------------
-- 2. Spaced Repetition (FSRS State)
-- --------------------------------------------------------
-- BKT probabilities are managed dynamically per session via the graph overlay and Narrative Check-in.
-- FSRS dictates the absolute memory decay and review scheduling.
CREATE TABLE fsrs_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    knowledge_node_uuid UUID NOT NULL, -- References Neo4j node
    
    -- FSRS Parameters
    stability FLOAT NOT NULL DEFAULT 0.0,
    difficulty FLOAT NOT NULL DEFAULT 0.0,
    retrievability FLOAT NOT NULL DEFAULT 0.0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    state VARCHAR(20) NOT NULL DEFAULT 'new', -- new, learning, review, relearning
    due_at TIMESTAMP WITH TIME ZONE,
    last_review TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(student_id, knowledge_node_uuid)
);

-- --------------------------------------------------------
-- 3. Telemetry & Analytics (DuckDB Source)
-- --------------------------------------------------------
-- Highly optimized append-only log for interactions.
CREATE TABLE interaction_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor_id UUID NOT NULL REFERENCES users(id),
    session_id UUID NOT NULL,
    event_name VARCHAR(50) NOT NULL, -- mood_selected, story_submitted, target_answered
    context JSONB NOT NULL, -- { mode: 'story', exam_track: 'ielts' }
    object_id UUID, -- The specific exercise or node id
    is_correct BOOLEAN,
    response_ms INTEGER,
    payload JSONB -- Raw answers, hesitation_rate, TTR, etc.
);

-- Indexing for DuckDB efficient querying
CREATE INDEX idx_interaction_events_actor ON interaction_events(actor_id);
CREATE INDEX idx_interaction_events_date ON interaction_events(occurred_at);

-- --------------------------------------------------------
-- 4. Tutor / MKO Review Queue (Curriculum Factory)
-- --------------------------------------------------------
-- When the ML sidecar parses uploaded materials, it stages them here for the Tutor to approve
-- before they are inserted into the student's active learning path.
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'modified');

CREATE TABLE tutor_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES users(id),
    student_id UUID REFERENCES users(id), -- Nullable if global material
    source_material_uri VARCHAR(512), -- URL to video/pdf
    extracted_text TEXT NOT NULL,
    proposed_metadata JSONB NOT NULL, -- { cefr: 'B1', topic: 'technology', targets: [...] }
    embeddings VECTOR(768), -- Sentence Transformer embeddings
    status review_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_review_queue_tutor ON tutor_review_queue(tutor_id, status);

-- --------------------------------------------------------
-- 5. Goal Setting & Assessment Restrictions (Self-Learner vs Tutor)
-- --------------------------------------------------------

-- Tracks specific learning goals and deadlines. 
-- For tutor-assigned goals, the tutor's deadline takes precedence.
CREATE TABLE learning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    knowledge_node_uuid UUID NOT NULL, -- The specific domain node to master
    tutor_id UUID REFERENCES users(id), -- If NULL, this is a self-learner goal
    target_mastery FLOAT NOT NULL DEFAULT 0.85,
    deadline TIMESTAMP WITH TIME ZONE,
    self_set_deadline TIMESTAMP WITH TIME ZONE, -- Must be <= deadline if tutor_id is NOT NULL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tracks test mode registrations to enforce quotas
-- Quotas: 'practice_drill' (max 10/month), 'strict_exam' (max 2/month self-assigned, max 1/month tutor-assigned)
CREATE TYPE test_mode AS ENUM ('practice_drill', 'strict_exam');

CREATE TABLE test_mode_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode test_mode NOT NULL,
    assigned_by_tutor_id UUID REFERENCES users(id), -- If NULL, student registered voluntarily
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_test_registrations_student_month ON test_mode_registrations(student_id, date_trunc('month', created_at));
