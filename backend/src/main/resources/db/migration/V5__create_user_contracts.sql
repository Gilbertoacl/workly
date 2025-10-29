-- V4__create_user_contracts.sql
CREATE TABLE user_contracts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_link_hash CHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_user_contracts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_contracts_job FOREIGN KEY (job_link_hash) REFERENCES scraped_jobs(link_hash) ON DELETE CASCADE,
    CONSTRAINT uq_user_job UNIQUE (user_id, job_link_hash)
);
