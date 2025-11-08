import winston from "winston";
import "winston-daily-rotate-file";

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp()
);

const fileFormat = winston.format.json();

const transports = {
  console: level => {
    return new winston.transports.Console({
      level,
      format: consoleFormat
    });
  },
  file: level => {
    return new winston.transports.File({
      level,
      dirname: "logs",
      format: fileFormat
    });
  },
  rotate: level => {
    const options = {
      dirname: "logs",
      filename: (level ?? "log") + "-%DATE%.log",
      format: fileFormat,
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxFiles: "14d"
    };

    if (level) {
      options.level = level;
    }

    return new winston.transports.DailyRotateFile(options);
  }
};

/**
 * Get an array of "default" transports.
 * If the given parameter is an array, it is supposed to already be treated and will return the array.
 *
 * @param options An object of transport name to transpot level
 * Available transport names are:
 *  - "console"
 *  - "file"
 *  - "rotate" for daily rotating file
 *  - Anything else, will get the value added to the returned value.
 *
 * This is in order to add transports in the same object.
 *
 * @return An array with the corresponding transports for available transport names, and the value for the unknown transport names.
 */
export default options => {
  if (Array.isArray(options)) {
    return options;
  }

  const trs = [];

  for (const key of Object.keys(options)) {
    if (transports[key]) {
      trs.push(transports[key](options[key]));
    } else {
      trs.push(options[key]);
    }
  }

  return trs;
};
