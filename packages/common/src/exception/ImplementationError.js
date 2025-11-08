export default class ImplementationError extends Error {
  constructor(message, options) {
    super(message, options);
  }

  static implementMethod(cls, method) {
	  throw new ImplementationError(`Method "${method}" of class "${cls}" should be implemented in child class`);
  }

	static implementConstructor(cls) {
		throw new ImplementationError(`This class "${cls}" shouldn't be implemented directly, please extend it`);
	}
}

