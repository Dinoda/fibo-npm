import { Database } from 'fibo-database';
import Validator, { types as v } from 'fibo-validate';
import CRUDValidationError from './exception/validationError.js';
import CRUDError from './exception/CRUDError.js';

const opeValidator = new Validator({
  sql: v.requiredAnd(v.string),
  // params: [Optional] Default to []
  params: v.nullableOr(v.or(v.array, v.object)),
  // hydrator: [Optional] Name of the hydrator for this operation
  // Default to option's "defaultHydrator" (or "defaultUpdateHydrator", if "select" is false)
  hydrator: v.nullableOr(v.string),
  // validator: [Optional] Name of the validator for this operation
  // Default to option's "defaultValidator"
  validator: v.nullableOr(v.string),
  // select: [Optional] Default to "false", indicate if the operation is a "SELECT". If true, validation is processed after
  // By default, the validation operation is performed before the query
  select: v.nullableOr(v.boolean),
  // delete: [Optional] Default to "false", indicate if the operation is a "DELETE" operation. Disabling validation.
  delete: v.nullableOr(v.boolean),
});

const optValidator = new Validator({
  // hydrators: [Optional] No hydration is mandatory, this is an object with hydration callables
  hydrators: 'object',
  // defaultHydrator: [Optional] Define the default hydrator from "hydrators"
  // Default is no hydration, plain database returned objects
  defaultHydrator: 'string',
  // defaultUpdateHydrator: [Optional] Define the default hydrator for non-select operations
  defaultUpdateHydrator: 'string',
  // validators: [Optional] Some validators if needed
  validators: 'object',
  // defaultValidator: [Optional] Define the default validator
  // Default to no validation
  defaultValidator: 'string',
});

/**
 * => Request => Operation (Parameters, Object) => Hydration => Result => 
 *
 *
 */
export default class CRUD {
  constructor(database, operations, options = {}) {
    if (! (database instanceof Database)) {
      throw new CRUDError("database is expected to be an instance of Database");
    }

    if (! optValidator.validate(options)) {
      throw new CRUDError(`Options are not valid`, optValidator.detail(options));
    }

    for (const k in operations) {
      const ope = operations[k];
      if (! opeValidator.validate(ope)) {
        throw new CRUDError(`Operation "${k}" is not a valid operation`, opeValidator.detail(ope));
      }
    }

    this.db = database;
    this.operations = operations;

    if (options.hydrators) {
      this.hydrators = options.hydrators;
      this.defaultHydrator = options.defaultHydrator ? this.hydrators[options.defaultHydrator] : (a) => a;
      this.defaultUpdateHydrator = options.defaultUpdateHydrator ? this.hydrators[options.defaultUpdateHydrator] : (a) => a.affectedRows > 0;
    } else {
      this.hydrators = {};
      this.defaultHydrator = (a) => a;
      this.defaultUpdateHydrator = (a) => a.affectedRows > 0;
    }

    if (options.validators) {
      this.validators = options.validators;
      this.defaultValidator = options.defaultValidator ? this.validators[options.defaultValidator] : null;
    } else {
      this.validators = {};
      this.defaultValidator = null;
    }
  }

  async callOperation(name, data) {
    const ope = this.operations[name];

    if (!ope) {
      throw new CRUDError(`Unknown operation "${name}", couldn't proceed`);
    }

    const validator = this.getValidator(ope);

    if (!ope.delete && !ope.select) {
      if (validator && ! validator.validate(data)) {
        throw new CRUDValidationError(`Unvalid data provided for operation "${name}", failure to process operation`, validator.detail(data));
      }
    }


    console.log(data);
    const fields = this.resolveFields(ope.params, data);

    console.log(fields);
    const result = await this.db.query(ope.sql, fields);

    const hydrated = this.hydrate(ope.hydrator, result, ope.select);

    if (!ope.delete && ope.select && validator) {
      const h = v.object(hydrated) ? Object.values(hydrated) : hydrated;
      for (const row of h) {
        if (! validator.validate(row)) {
          throw new CRUDValidationError(`Hydrated data is not valid for operation "${name}", check your validator and hydrator or fix your database`, validator.detail(row));
        }
      }
    }

    return hydrated;
  }

  resolveFields(params, data) {
    if (!params) {
      return [];
    }

    if (v.array(params)) {
      return params.map((a) => {
        return data[a];
      });
    }

    return Object.keys(params).map((k) => {
      const type = params[k];

      switch(type) {
        case 'number':
          const f = parseFloat(data[k]);
          return Number.isNaN(f) ? null : f;
          break;
        case 'integer': 
          const i = parseInt(data[k]);
          return Number.isNaN(i) ? null : i;
          break;
        default:
          return data[k] ? data[k] : null;
      }
    });
  }

  hydrate(hydrator, data, select) {
    if (hydrator) {
      return this.hydrators[hydrator](data);
    }

    return select ? this.defaultHydrator(data) : this.defaultUpdateHydrator(data);
  }

  getValidator(ope) {
    if (ope.validator) {
      return this.validators[ope.validator];
    }

    return this.defaultValidator;
  }
}
