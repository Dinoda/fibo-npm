export default `
CREATE TABLE IF NOT EXISTS \`genesis\`(
	\`filename\` VARCHAR(100) PRIMARY KEY,
	\`status\` ENUM('loaded', 'reversed', 'none') NOT NULL DEFAULT 'none',
	\`last_update\` DATETIME NOT NULL DEFAULT NOW()
)
`;
