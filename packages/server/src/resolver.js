import { CRUDValidationError } from 'fibo-crud';
const respond = (res, err, data = null, status = 200) => {
  if (status != 200) {
    res.status(status);
  }
  res.send({
    status,
    err,
    data
  });
};

export default (res, promise) => {
  promise.then(data => {
    respond(res, null, data);
  }).catch(err => {
      if (err instanceof CRUDValidationError) {
        respond(
          res, 
          err.message + ': ' + Object.entries(err.details).reduce((arr, [key, value]) => { 
            if (!value) { return [...arr, key]; } 
            return arr;
          }, []).join(', '),
          null, 
          400
        );
      } else {
        console.error(err);
        respond(res, "Server error", null, 500);
      }
    });
};
