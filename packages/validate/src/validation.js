import Validator from "./Validator.js";

export function getAllKeys(entity) {
  const a = Object.keys(entity);

  Object.keys(this.validators).forEach(item => {
    if (!a.some(aItem => item === aItem)) {
      a.push(item);
    }
  });

  return a;
}

export function getEntityKeys(entity) {
  return Object.keys(entity);
}

export function getValidatorKeys(entity) {
  return Object.keys(this.validators);
}

export function std(key, entity, validator) {
  if (!validator) {
    return true;
  }
  return validator(entity[key], entity);
}

export function woValidator(key, entity, validator) {
  if (!validator) {
    return false;
  }
  return validator(entity[key], entity);
}

export function validate(keys, entity) {
  for (const key of keys) {
    if (!this.__valid(key, entity, this.validators[key])) {
      return false;
    }
  }

  return true;
}

export function validateWithDepth(keys, entity) {
  for (const key of keys) {
    const vld = this.validators[key];
    if (this.validators[key] instanceof Validator) {
      if (!vld.validate(entity[key])) {
        return false;
      }
    } else {
      if (!this.__valid(key, entity, vld)) {
        return false;
      }
    }
  }

  return true;
}

export function detail(keys, entity) {
  const result = {};

  for (const key of keys) {
    result[key] = this.__valid(key, entity, this.validators[key]);
  }

  return result;
}

export function detailWithDepth(keys, entity) {
  const result = {};

  for (const key of keys) {
    const vld = this.validators[key];
    if (vld instanceof Validator) {
      result[key] = vld.detail(entity[key]);
    } else {
      result[key] = this.__valid(key, entity, vld);
    }
  }

  return result;
}
