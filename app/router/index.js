/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:26:40
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */

'use strict';

const Router = require('koa-router');
const routes = require('./routes');
const schemas = require('../schema');
const paramValidator = require('../middlewares/paramsValidator');
const config = require('../config');
const { join, } = require('path');
const router = new Router();

schemas.init();

routes.forEach(item => {
  let method = item.method || 'all';
  if (!item.controller) return new Error('请检查 control 方法是否遗漏');
  let pre = config.urlPrefix[item.type || 'a'];
  let prePath = join(pre, item.path);

  router[method](prePath, paramValidator(item.controller.paramSchema), item.controller);
});

module.exports = router;
