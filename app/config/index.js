/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:24:50
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */

'use strict';
const path = require('path');
const APP_PORT = process.env.APP_PORT || 80;
const APP_HOST = process.env.APP_HOST || '0.0.0.0';
const { version, } = require('../../package.json');

const env = process.env.NODE_ENV || 'development';
const name = process.env.APP_NAME || 'url-service';

const urlPrefixAPI = '/api/';

const configs = {
  base: {
    env,
    name,
    host: 'localhost',
    port: 5000,
    version,
    // 前缀开头末尾需要加 '/'
    urlPrefix: {
      a: urlPrefixAPI,
      b: '/',
      d: '/document/',
    },
    redis: {
      port: 6379,
      host: '120.55.91.225',
      password: 'IP3Do6/hTUpHrR0E',
    },
    viewsDir: 'views',
    debug: !env || [ 'development', 'base', ].includes(env),
    pathFile: process.cwd(),
    packageAssets: path.join('public', 'assets'),
  },

  production: {
    port: APP_PORT,
    host: APP_HOST,
  },

  // 用于 持续集成： gitlab-ci.yml 执行
  development: {
    port: APP_PORT,
    host: APP_HOST,
  },

  daily: {
    port: APP_PORT,
    host: APP_HOST,
  },
};
const config = Object.assign(configs.base, configs[env]);

module.exports = config;
