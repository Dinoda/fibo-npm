import ValidatorError from "./exception/ValidatorError.js";
import * as v from "./typing.js";
import * as functions from "./validation.js";

const defaultOptions = {
  depth: 0,
  maxDepth: 0,
  /**
   * Will only validate for the entity's keys (false by default).
   *
   * By default, the validator will validate all keys, from validated entity and validators.
   */
  entityOnly: false,
  /**
   * Will consider a key without validator a failure (default to false).
   */
  failWithoutValidator: false,
  /**
   * Will only validate for the validator's keys, ignore if entityOnly is set to true (false by default)
   *
   * By default, the validator will validate all keys, from validated entity and validators.
   */
  validatorOnly: false,
  /**
   * Validate if the given entity is empty (null, undefined, empty string), true by default
   */
  validEmpty: true
};

export default class Validator {
  constructor(parameters, options) {
    this.parameters = parameters;

    this.options = {
      ...defaultOptions,
      ...options
    };

    if (this.options.depth > this.options.maxDepth) {
      throw new ValidatorError("Parameter depth above given max depth");
    }

    this.getValidators();

    this.getKeys = this.options.entityOnly
      ? functions.getEntityKeys.bind(this)
      : this.options.validatorOnly
      ? functions.getValidatorKeys.bind(this)
      : functions.getAllKeys.bind(this);

    this.__valid = this.options.failWithoutValidator
      ? functions.woValidator.bind(this)
      : functions.std.bind(this);

    this.__validate =
      this.options.maxDepth > 0
        ? functions.validateWithDepth.bind(this)
        : functions.validate.bind(this);

    this.__detail =
      this.options.maxDepth > 0
        ? functions.detailWithDepth.bind(this)
        : functions.detail.bind(this);
  }

  getValidators() {
    if (!v.object(this.parameters)) {
      if (v.callable(this.parameters)) {
        this.validators = this.parameters;
      } else if (v.string(this.parameters)) {
        this.validators = this.resolveString(this.parameters);
      } else {
        throw new ValidatorError(
          `Unknown validator is parameter: ${typeof this.parameters} "${
            this.parameters
          }"`
        );
      }

      return;
    }

    this.validators = {};

    for (const key of Object.keys(this.parameters)) {
      const param = this.parameters[key];

      if (v.callable(param)) {
        this.validators[key] = param;
      } else if (v.object(param)) {
        this.validators[key] = this.subValidator(key, param);
      } else if (v.string(param)) {
        this.validators[key] = this.resolveString(param);
      } else {
        throw new ValidatorError(
          `Unknown validator is parameter: ${typeof param} "${param}"`
        );
      }
    }
  }

  subValidator(key, param) {
    const opt = { ...this.options, depth: this.options.depth + 1 };

    if (this.options.children && this.options.children[key]) {
      Object.keys(this.options.children[key]).reduce((obj, k) => {
        obj[k] = this.options.children[key][k];
      }, opt);

      if (!this.options.children[key].children) {
        opt.children = undefined;
      }
    }

    return new Validator(param, opt);
  }

  resolveString(vld) {
    if (vld.charAt(0) == "!") {
      return v.requiredAnd(v[vld.slice(1)]);
    }

    return v.nullableOr(v[vld]);
  }

  validate(element) {
    if (this.options.validEmpty && v.nullable(element)) {
      return true;
    }

    const keys = this.getKeys(element);

    return this.__validate(keys, element);
  }

  detail(element) {
    if (this.options.validEmpty && v.nullable(element)) {
      return true;
    }

    const keys = this.getKeys(element);

    return this.__detail(keys, element);
  }
}
