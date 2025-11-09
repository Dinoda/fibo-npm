import CRUD from '../model/work.crud.js';

export const get = async (req, res) => {
  let response;
  if (req.params.id) {
    response = await CRUD.select(req.params);
  } else {
    response = await CRUD.selectAll();
  }

  res.send(response);
};
