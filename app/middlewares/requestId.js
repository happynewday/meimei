/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:26:30
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */

// https://github.com/posquit0/koa-rest-api-boilerplate

'use strict';

const uuidV4 = require('uuid/v4');

/**
 * Return middleware that gets an unique request id from a header or
 * generates a new id.
 *
 * @param {Object} [options={}] - Optional configuration.
 * @param {string} [options.header=X-Request-Id] - Request and response header name.
 * @param {string} [options.propertyName=reqId] - Context property name.
 * @param {function} [options.generator] - Id generator function.
 * @return {function} Koa middleware.
 */
function requestId (options = {}) {
  const { header = 'X-Request-Id', propertyName = 'reqId', generator = uuidV4, } = options;

  return (ctx, next) => {
    const reqId = ctx.request.get(header) || generator();
    ctx[propertyName] = reqId;
    ctx.set(header, reqId);
    return next();
  };
}

module.exports = requestId;
