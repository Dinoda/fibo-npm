import CLI from 'fibo-cli';

export default new CLI([
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
    option: 'prefix',
    argument: "dir",
    short: "d",
    mustHaveValue: true,
  },
  {
    argument: 'force',
  },
  {
    argument: 'verbose',
    short: 'v',
  }
], process.argv);
