import CLI from 'fibo-cli';

const CLICfg = [
  {
    argument: 'all',
    short: 'a',
  },
  {
    argument: 'new',
    short: 'n',
    canHaveValue: true,
  },
  {
    argument: "reverse",
    short: "r",
    callback: (options, name, value) => {
      options[name] = true;
      if (value) {
        options['reverseDir'] = value;
      }
    },
  },
  {
    option: 'directory',
    argument: "dir",
    short: "d",
    mustHaveValue: true,
  },
  {
    argument: 'force',
    short: 'f'
  },
  {
    argument: 'verbose',
    short: 'v',
  }
];

const DEFAULT_OPTIONS = {
  directory: "./genesis/migration/",
  reverse: false,
  reverseDir: "../reverse",
  force: false,
};

export default (defaultOpt = {}) => {
  return new CLI(CLICfg, process.argv, {
      ...DEFAULT_OPTIONS,
      ...defaultOpt,
    });
};
