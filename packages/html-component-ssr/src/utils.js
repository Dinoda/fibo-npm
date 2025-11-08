export const flatten = (array) => {
  for (let i = 0;i < array.length;i++) {
    if (Array.isArray(array[i])) {
      Array.prototype.splice.apply(array, [i, 1, ...array[i]]);
      i--;
    }
  }

  return array;
};

export const clean = (array) => {
  for (let i = 0;i < array.length;i++) {
    if (!array[i]) {
      array.splice(i, 1);
      i--;
    }
  }

  return array;
};
