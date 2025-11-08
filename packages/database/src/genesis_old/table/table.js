const CREATE = `
CREATE TABLE IF NOT EXISTS \`genesis\`(
	\`filename\` VARCHAR(100) PRIMARY KEY,
	\`status\` ENUM('loaded', 'reversed', 'none') NOT NULL DEFAULT 'none',
	\`last_update\` DATETIME NOT NULL DEFAULT NOW()
)
`;

const table = function (db, tableName, sql) {
  this.db = db;
  this.tableName = tableName;
  this.sql = sql ?? CREATE;
  this.uptodate = false;
};

table.init = function() {
  this.
};
table.getTableStatus = function () {
  return this.uptodate;
};
