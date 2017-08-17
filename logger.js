let winston = require('winston')
let path = require('path')
winston.emitErrs = true

let logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
})

module.exports = logger

module.exports.stream = {
  write: function (message, encoding) {
        /*
        took it from https://github.com/baryon/tracer/blob/master/lib/console.js
        */
    let data = {}
    data.method = data.path = data.line = data.pos = data.file = ''

        // if (needstack) {
    if (true) {
            /* get call stack, and analyze it
            // get all file,method and line number */
      let stacklist = (new Error()).stack.split('\n').slice(3)
            // Stack trace format :
            // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
            // DON'T Remove the regex expresses to outside of method, there is a BUG in
            // node.js!!!
      let stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
      let stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi
            // let s = stacklist[config.stackIndex] || stacklist[0],
      let s = stacklist[0],
        sp = stackReg.exec(s) || stackReg2.exec(s)
      if (sp && sp.length === 5) {
        data.method = sp[1]
        data.path = sp[2]
        data.line = sp[3]
        data.pos = sp[4]
        data.file = path.basename(data.path)
        data.stack = stacklist.join('\n')
      }
    }
    logger.info(data.method + ':' + data.line + ' ' + message)
  }
}
