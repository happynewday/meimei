/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:25:11
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */

const path = require('path');
const { env, name, } = require('./');

const directory = process.env.LOG_DIRECTORY || path.join(__dirname, '../../');
const filename = process.env.LOG_FILENAME || `${name}.${env}.json.log`;

const config = {
  name,
  streams: [],
};

// refactor 增加代码覆盖率
const streams = {
  production: [
    {
      type: 'rotating-file',
      path: path.join(directory, filename),
      period: '1d',
      count: 7,
      level: process.env.LOG_LEVEL || 'info',
    },
    {
      type: 'stream',
      stream: process.stderr,
      level: 'warn',
    },
  ],
  development: [
    {
      type: 'stream',
      stream: process.stdout,
      level: 'debug',
    },
  ],
  base: [],
};

config.streams = streams[env];
module.exports = config;
