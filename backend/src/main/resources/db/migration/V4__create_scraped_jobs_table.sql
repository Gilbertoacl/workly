CREATE TABLE scraped_jobs (
    id BIGSERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    link TEXT NOT NULL,
    link_hash CHAR(64) NOT NULL,
    description TEXT,
    skills TEXT,
    original_budget VARCHAR(100),
    min_budget DECIMAL(10,2),
    max_budget DECIMAL(10,2),
    proposals INT,
    conversion_method VARCHAR(50),
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (link_hash)
);

CREATE INDEX idx_scraped_jobs_title ON scraped_jobs(title);