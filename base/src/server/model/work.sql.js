export const SELECT_ALL = `
SELECT id, name, description, parent
FROM work
`;

export const SELECT_ROOT = SELECT_ALL + `
WHERE work IS NULL
`;

export const SELECT = SELECT_ALL + `
WHERE id = :id
`;

export const UPDATE = `
UPDATE work
SET
  name = ?,
  description = ?,
  parent = ?
WHERE
  id = ?
`;

export const INSERT = `
INSERT INTO work (name, description, parent) VALUE (?, ?, ?)
`;
