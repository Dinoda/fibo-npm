/**
 * Returns a validator with v1 & v2 validator needed.
 *
 * @param v1 A validator (receives a value and returns a boolean)
 * @param v2 A validator (receives a value and returns a boolean)
 * @return An "and" validator
 */
export const and = (v1, v2) => {
  return value => {
    return v1(value) && v2(value);
  };
};

/**
 * Returns a validator with v1 | v2 validator needed.
 *
 * @param v1 A validator (receives a value and returns a boolean)
 * @param v2 A validator (receives a value and returns a boolean)
 * @return An "or" validator
 */
export const or = (v1, v2) => {
  return value => {
    return v1(value) || v2(value);
  };
};

/**
 * A validator
 *
 * Check if the value is given (not null, undefined, or empty string)
 *
 * @return boolean
 */
export const required = elem => {
  return elem != null && elem != "";
};

/**
 * A validator
 *
 * Check if the value is empty (null, undefined or an empty string)
 *
 * @return boolean
 */
export const nullable = elem => {
  return null == elem || "" == elem;
};

/**
 * Returns a validator with "required" and the given validator
 *
 * Equivalent to and(v, required).
 *
 * @param v A validator (receives a value and returns a boolean)
 *
 * @return An "and" validator with required and the argument
 */
export const requiredAnd = v => {
  return value => {
    return v(value) && required(value);
  };
};

/**
 * Returns a validator with "nullable" or the given validator
 *
 * Equivalent to or(v, nullable).
 *
 * @param v A validator (receives a value and returns a boolean)
 *
 * @return An "or" validator with nullable and the argument
 */
export const nullableOr = v => {
  return value => {
    return v(value) || nullable(value);
  };
};

/**
 * A validator.
 *
 * Return true if the parameter is a non-array object
 *
 * @param elem The checked element
 * @return boolean True if elem is an object, else false
 */
export const object = elem => {
  return typeof elem === "object" && !Array.isArray(elem);
};

/**
 * A validator.
 *
 * Returns true if the parameter is a string
 *
 * @param elem The checked element
 * @return boolean True if elem is a string, else false
 */
export const string = elem => {
  return typeof elem === "string" || elem instanceof String;
};

export const array = elem => {
  return Array.isArray(elem);
};

export const number = elem => {
  return elem != null && isFinite(elem);
};

export const integer = elem => {
  return Number.isInteger(elem) || (string(elem) && parseInt(elem, 10) == elem);
};

export const range = elem => {
  if (integer(elem)) {
    return true;
  }

  if (string(elem)) {
    for (const piece of elem.split(",")) {
      if (!integer(piece)) {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
};

export const boolean = elem => {
  return elem === true || elem === false;
};

export const callable = elem => {
  return typeof elem == "function";
};

export const isaninstanceof = cls => {
  return (elem) => {
    return elem instanceof cls;
  };
};
