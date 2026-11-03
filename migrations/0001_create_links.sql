-- Migration number: 0001 	 create the links table
CREATE TABLE links (
  slug       TEXT PRIMARY KEY,
  url        TEXT NOT NULL,
  clicks     INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER
);

CREATE INDEX idx_links_expires_at ON links (expires_at) WHERE expires_at IS NOT NULL;
