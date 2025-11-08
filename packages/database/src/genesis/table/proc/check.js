export default (genesis, fs, table) => {

  return Promise.all([
    genesis.check(),
    fs.check(),
    table.check(),
  ]);
};
