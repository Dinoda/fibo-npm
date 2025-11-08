export default (genesis, fs, table) => {

  genesis.setFileSystem(fs);
  genesis.setTable(table);
  fs.setTable(table);

  return Promise.all([
    genesis.load(),
    fs.load(),
    table.load(),
  ]);
};
