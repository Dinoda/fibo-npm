import { createRouter } from 'fibo-server';

import { get } from '../resolver/work.js';

const rtr = createRouter();

rtr.route('/api/work{/:id}')
  .get(get);

export default rtr;
