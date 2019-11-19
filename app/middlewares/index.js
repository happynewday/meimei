/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:26:19
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */
'use strict';

// Load APM on production environment
// const apm = require('./apm');

const koaBody = require('koa-body');
const cors = require('@koa/cors');
const errorHandler = require('./errorHandler');
const favicon = require('koa-favicon');

const requestId = require('./requestId');
const responseHandler = require('./responseHandler');
const router = require('../router');
const { join, parse, } = require('path');
const serve = require('koa-static');

const logMiddleware = require('./log');
const bunyan = require('bunyan');
const loggerConfig = require('../config/logger.js');
const { viewsDir, host, port, pathFile, packageAssets, redis, } = require('../config');
const session = require('koa-session2');
const RedisStore = require('../common/redis');
const views = require('koa-views');

/**
 * 日志处理中间件
 */
const mdLogger = logMiddleware({
  logger: bunyan.createLogger(
    Object.assign(
      {
        serializers: bunyan.stdSerializers,
        hostname: host + ':' + port,
        time: Date().toLocaleString(),
      },
      loggerConfig
    )
  ),
});

/**
 * 生成请求 uuid
 */
const mdRequestId = requestId();

/**
 * 格式化 from， text， json 数据
 */
const mdKoaBody = koaBody({
  enableTypes: [ 'json', 'form', 'text', ],
  textLimit: '2mb',
  formLimit: '1mb',
  jsonLimit: '5mb',
  strict: true,
  multipart: true,
  onerror: function (err, ctx) {
    ctx.throw(422, new Error(`body parse error: ${err}`), { bcode: 20011, });
  },
  // extendTypes: {
  //   json: ['application/x-javascript']
  // }
});

/**
 * 允许跨域
 */
const mdcors = cors({
  origin: '*',
  allowMethods: [ 'GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH', ],
  // exposeHeaders: [ 'X-Request-Id', ],
});

/**
 * res 格式化处理
 */
const mdResHandler = responseHandler();
/**
 * res 错误处理
 */
const mdErrorHandler = errorHandler();

/**
 * 路由
 */
const mdRouter = router.routes();
const mdRouterAllowed = router.allowedMethods();

/**
 * favicon
 */
const mdFavicon = favicon(join(__dirname, '../../public/favicon.ico'));

/**
 * 静态资源
 */
const mdAssets = serve(join(pathFile, parse(packageAssets).dir));

/**
 * session 持久化 redis
 * 需要 优先于 页面 koa-view 之前 use
 */
const sessionRedis = session({
  store: new RedisStore(redis),
});

/**
 * views
 */
const mdViews = views(join(__dirname, '..', viewsDir), {
  extension: 'ejs',
});

/**
 * 流控 与 API签名
 */
// myCheck.apiAuth()

module.exports = [
  sessionRedis,
  mdFavicon,
  mdAssets,
  mdViews,
  mdKoaBody,
  mdcors,
  mdRequestId,
  mdLogger,
  mdResHandler,
  mdErrorHandler,
  mdRouter,
  mdRouterAllowed,
];
