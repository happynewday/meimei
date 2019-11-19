/*
 * @Author: highsea.高海
 * @Date: 2019-03-13 14:01:56
 * @Copyright(c) QuVideo F2E Team
 * @Email: hai.gao@quvideo.com
 */

const Redis = require('ioredis');
const { Store, } = require('koa-session2');
const Log = console;

// https://github.com/Secbone/koa-session2

class RedisStore extends Store {
  constructor (opt) {
    let options = Object.assign(RedisStore.options, opt);
    const { host, } = options;
    if (!host) {
      const error = new Error('RedisStore options required parameters: host');
      error.code = 'REDIS_OPTIONS_INVALID';
      throw error;
    }
    super();
    options['retryStrategy'] = function (times) {
      let delay = Math.min(times * options.retryMultiple, options.maxRetryInterval);
      return delay;
    };
    this.resOpt = options;
    this.redis = new Redis(options);
    this.redis.on('ready', () => {
      Log.info('\n session-redis 持久化 ready : %s:%s', options.host, options.port);
    });
  }

  /**
   * 默认参数
   * @static
   */
  static get options () {
    return {
      port: this.port || 6379,
      host: this.host,
      family: 4,
      password: '',
      // db: 0,
      // 60 * 60 * 4
      ttl: 14400,

      logger: console,
      debug: false,
      retryMultiple: 50,
      maxRetryInterval: 2000,

      // connectionLimit: 5,
      // connectTimeout: 1000 * 30,
    };
  }

  // 对 key 做了混淆 getID(24)
  async get (sid, ctx) {
    let data = await this.redis.get(`SESSION:${sid}`);
    return JSON.parse(data);
  }

  async set (session, { sid = this.getID(24), maxAge = this.resOpt.ttl, } = {}, ctx) {
    try {
      // Use redis set EX to automatically drop expired sessions
      await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge);
    } catch (e) {}
    return sid;
  }

  async destroy (sid, ctx) {
    const res = await this.redis.del(`SESSION:${sid}`);
    return res;
  }
}

module.exports = RedisStore;
