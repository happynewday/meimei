#!/usr/bin / env node

'use strict';
const Log = console;
const { port, host, env, debug, } = require('./config');
// 错误监控
const Koa = require('koa');
const compose = require('koa-compose');
const MD = require('./middlewares/');
const app = new Koa();

app.proxy = true;
app.use(compose(MD));

function onError (err, ctx) {
  if (err.bcode) {
    ctx.log.warn({ err, event: 'error', }, `业务错误码 ${err.bcode}`);
  } else {
    Log.error('\n===未捕获的错误=== ', err);
    // TODO XHR 兼容
    if (ctx) {
      ctx.body = {
        code: 40000,
        message: `出错了-未捕获的错误，\n${err.message} \n ${debug ? err.stack : ''}`,
      };
    }
  }
}

app.on('analysis', (data, ctx) => {
  // TODO 各类 统计系统
  Log.info('------analysis-----', data);
  // curl()
});

app.on('error', onError);

if (!module.parent) {
  const server = app.listen(port, host, () => {
    Log.info({ event: 'execute', }, `API server listening on ${host}:${port}, in ${env}`);
  });
  server.on('error', onError);
}

module.exports = {
  app,
  onError,
};
