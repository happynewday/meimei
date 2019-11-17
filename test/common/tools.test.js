/*
 
 * @Date: 2019-01-14 17:31:45
 * 
 * 
 */

'use strict';

const { join } = require('path');
const { isUrl, checkObjProInArray, isEmpty, AveragePartAlg, arrSameNumber} = require('../../app/common/utils');
const assert = require('assert');
const should = require('should');
// const ENV = 'pre'

describe('tools.js', () => {
  
  before(() => {});

  it('utils #isUrl()', () => {
    const arr = [
      'https://f.g',
      'f.g.aaa.com',
      'ftp://s.cn:20/fff',
      'http://s.cn:8080/?c=1&d=2#333',
      'http://f.g.aaa.com?c=1&d=2#333',
      'http://user:pwd@f.g.aaa.com?c=1&d=2#333',
    ];
    let num = 0
    arr.map((cval, index, arr)=> {
      if (isUrl(cval)) num++;
    });
    assert.deepEqual(num, 4);
  });

  it('utils #checkObjProInArray', () => {
    const arr = [{ name: 1 }, { name: 'd234' }, { name: 'x210' }];
    checkObjProInArray(arr, 'name', 'd23').should.equal(true)
  })

  it('utils #isEmpty', () => {
    const arr = [{}, [], null, undefined, ''];
    const res = arr.some((cval, index, a) => {
      return !isEmpty(cval)
    });
    res.should.equal(false);
  });

  it('utils #AveragePartAlg', () => {
    let res = AveragePartAlg('15158106748', 10);
    res.should.equal('5');
  });

  it('utils #arrSameNumber', () => {
    let arr = ['1', '0', '2', '0', '2', '2', '1', '2', '1', '0'];
    let res = arrSameNumber(arr);
    assert.deepStrictEqual(res, {
      res: { '0': 3, '1': 3, '2': 4 },
      keyLen: 3,
      KeyPartElementLen: { avg: 3, max: 4, min: 3 }
    });
  });

});
