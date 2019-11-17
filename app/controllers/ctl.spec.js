/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:20:11
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */

'use strict';

const pkginfo = require('../../package.json');
const spec = require('../spec');

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Public
 *     summary: Get API information.
 *     operationId: getApiInfo
 *     responses:
 *       200:
 *         description: Describe general API information
 */
exports.getApiInfo = ctx => {
  // BUSINESS LOGIC
  const data = {
    name: pkginfo.name,
    version: pkginfo.version,
    description: pkginfo.description,
    author: pkginfo.author,
  };

  return ctx.res.ok({
    data,
    message: 'url service .',
  });
};

/**
 * @swagger
 * /spec:
 *   get:
 *     tags:
 *       - Public
 *     summary: Get Open API specification.
 *     operationId: getSwaggerSpec
 *     responses:
 *       200:
 *         description: Describe Swagger Open API Specification
 */
exports.getSwaggerSpec = ctx => {
  ctx.body = spec;
};
