-- Step 10: API rate limit email notifications (one email per user per day)
CREATE TABLE IF NOT EXISTS api_rate_limit_notifications (
  clerk_id     TEXT PRIMARY KEY,
  notified_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
