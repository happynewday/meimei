/*
 
 * @Date: 2019-03-22 19:12:47
 * 
 * 
 */

'use strict';

const assert = require('assert')
// const { execPromise } = require('../app/common/utils') 
// const pool = require('../../common/mysql');
// http://mockjs.com/examples.html
// const mockjs = require('mockjs)

describe('app', () => {

  it('app export', () => {
    const { app, onError } = require('../app');
    assert.strictEqual(app.proxy, true)

  });

  // it('app module', async() => {
  //   let res = await execPromise('NODE_ENV=base APP_PORT=7378 node app/index.js')
  //   let check = await execPromise("lsof -i:7378 | grep node | awk '{print $2 }'")
  // });

})