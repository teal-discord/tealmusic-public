const pino = require("pino");
const { WebhookClient, EmbedBuilder } = require("discord.js");
const { inspect } = require("util");
const today = new Date();

function getClusterId(manager = true) {
  const str = process.env.CLUSTER;
  const d = str && (str !== undefined || str !== "undefined") ? str : undefined;
  if (!isNaN(d) || d === 0) return str;
  return manager ? "Manager" : undefined;
}
function getClusterStr() {
  return `${`Cluster-`.america}${`#${getClusterId()}`.america.bold}`;
}

function getTimeStr() {
  const [main, ms] = getTime().split(".");
  const [hh, mm, ss] = main.split(":");
  return `${`${hh}`.blue.dim}:${`${mm}`.blue}:${`${ss}`.blue}.${`${ms}`.blue.dim}`;
}

const pinoLogger = pino.default(
  { level: "debug" },
  pino.multistream([
    {
      level: "info",
      stream: pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "dd-mm-yyyy HH:mm:ss",
          ignore: "pid,hostname",
          singleLine: false,
          hideObject: true,
          customColors: "info:blue,warn:yellow,error:red",
        },
      }),
    },
    {
      level: "error",
      stream: pino.destination({
        dest: `${process.cwd()}/logs/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}.log`,
        sync: true,
      }),
    },
  ])
);

module.exports = class Logger {
  /**
   * @param {string} content
   */
  static log(content) {
    console.log(`${getTimeStr()} :: ${"Info    ".grey} ${"~".magenta} ${getClusterStr()}:`, content);
  }
  /**
   * @param {string} content
   */
  static warn(content) {
    pinoLogger.warn(content);
  }

  /**
   * @param {string} content
   * @param {object} ex
   */
  static error(content, ex) {
    if (ex) {
      pinoLogger.error(ex, `${content}: ${ex?.message}`);
    } else {
      pinoLogger.error(content);
    }
  }

  /**
   * @param {string} content
   */
  static debug(content) {
    console.log(`${getTimeStr()} :: ${"Debug   ".grey} ${"~".magenta} ${getClusterStr()}:`, content.dim);
  }
};

function getTime(timestamp = Date.now()) {
  const d = new Date(timestamp);
  return `${formatDoubleDigit(d?.getHours())}:${formatDoubleDigit(d?.getMinutes())}:${formatDoubleDigit(
    d?.getSeconds()
  )}.${formatTripleDigit(d?.getMilliseconds())}`;
}
function formatDoubleDigit(t) {
  return parseInt(t) < 10 ? `0${t}` : `${t}`;
}
function formatTripleDigit(t) {
  return parseInt(t) < 100 ? `0${formatDoubleDigit(t)}` : `${t}`;
}
