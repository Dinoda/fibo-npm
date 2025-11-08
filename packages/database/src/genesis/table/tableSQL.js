export const CREATE = `
CREATE TABLE IF NOT EXISTS \`genesis\`(
	\`filename\` VARCHAR(100) PRIMARY KEY,
	\`status\` ENUM('loaded', 'reversed', 'none') NOT NULL DEFAULT 'none',
	\`last_update\` DATETIME NOT NULL DEFAULT NOW()
)
`;

export const INSERT = `
INSERT INTO \`genesis\` (filename) VALUES (?)
`;

export const UPDATE = `
UPDATE \`genesis\`
SET status = ?
WHERE filename = ?
`;

export const LOAD = `
SELECT * FROM \`genesis\`
`;

