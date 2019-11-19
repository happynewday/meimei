/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:26:09
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */

'use strict';

const Joi = require('@hapi/joi');
const { isEmpty, } = require('../common/utils');

module.exports = paramSchema => {
  return async function (ctx, next) {
    let rawData = ctx.request.body;
    try {
      if (typeof rawData === 'string' && rawData.length) rawData = JSON.parse(rawData);
      ctx.log.info(
        {
          req: ctx,
          event: 'request',
        },
        `ctx.request.body is raw data(${Number(ctx.request.body.length)})`
      );
    } catch (error) {
      ctx.log.warn(
        {
          req: ctx,
          event: 'request',
        },
        `JSON.parse req.body error ${error}`
      );
    }
    const reqParam = {
      // headers: {},
      router: ctx.params,
      query: ctx.query,
      body: rawData,
      files: ctx.request.files,
      // 兼容 swagger 测试 curl 发送的请求, https://swagger.io/docs/specification/describing-request-body/
      // 并去除其他属性，防止报错：Cannot convert object to primitive value
      // swagger 没有用 -d 发送 body 数据
      merge: Object.assign(JSON.parse(JSON.stringify(ctx.query)), rawData),
      // 需要修改 swagger curl POST 请求 发送方式如下：
      // curl --header "Content-Type: application/json" \
      // --request POST \
      // --data '{"urlOrigin":"..."}' \
      // http://0.0.0.0:5000/api/url
      // 简写 ： (-H : --header, -d : --data)
    };

    ctx.reqParam = reqParam;
    if (!paramSchema) return next();

    let schemaKeys = Object.getOwnPropertyNames(paramSchema);
    if (!schemaKeys.length) return next();

    schemaKeys.some(item => {
      let validObj = reqParam[item];

      // 兼容 swagger 测试 curl 发送的请求, 同上
      if (isEmpty(validObj)) {
        validObj = reqParam['merge'];
        reqParam['body'] = validObj;
      }
      // 兼容 swagger 测试 curl 发送的请求, 结束

      let validResult = Joi.validate(validObj, paramSchema[item], {
        allowUnknown: true,
      });
      if (validResult.error) {
        ctx.throw(422, new Error(validResult.error.message), {
          bcode: 20001,
        });
        // ctx.res.fail({ statusCode: 100, code: 20001, message: validResult.error.message, });
      }
      // validResult.value
    });
    await next();
  };
};
