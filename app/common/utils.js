/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:25:17
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */

// const util = require('util');
const assert = require('assert');
const { createHash, } = require('crypto');
const RegDoc = {
  // 兼容 android-app 与 scheme
  url: /((http|ftp|https|file):\/\/([\w-]+\.)+[\w-]+(\/[\w\u4e00-\u9fa5\-.?@%!&=+~:#;,]*)?)/,
  shortid: /^[a-zA-Z0-9_-]{4,20}$/,
  nospace: /^\S+$/,
};
/**
 * 检查是否是 正确的 url
 * @param {String} url
 * @param {Boolean} return
 */
const isUrl = str => {
  return RegExp(RegDoc['url'], 'ig').test(str);
};

/**
 * 检查一个由相同键值对象组成的数组，判断某个对象属性值是否存在某一值
 * @param {String} protoName
 * @param {String} value
 * @param {Boolean} return
 *
 * ```js
 * const arr = [{name: 1}, {name: 'd234'}, {name: 'x210'}]
 * checkObjProInArray(arr, 'd2')// true
 * ```
 */
const checkObjProInArray = (arr, protoName, value) => {
  assert.ok(Array.isArray(arr), '需要输入 Array');
  const reg = new RegExp(value, 'ig');
  return arr.some((cval, index, a) => {
    return reg.test(cval[protoName]);
  });
};

/**
 * 将批量数据根据 取模算法 分区
 *
 * ```js
 * let arr = []
 * for (let i = 0; i < 10; i++) {
 *    arr[i] = AveragePartAlg(shortId.generate(), 3);
 * }
 * //arr [ '1', '0', '2', '0', '2', '2', '1', '2', '1','0']
 * ```
 * @param {any} str 需要分区的数据
 * @param {Number} part 要分的区个数
 */
const AveragePartAlg = (str, part) => {
  let md5arr = createHash('md5')
    .update(str.toString(), 'utf8')
    .digest('hex')
    .substr(0, 16)
    .split('');
  let res = 0;
  for (let i = 0, l = md5arr.length; i < l; i++) {
    res = (res * 16 + parseInt(md5arr[i], 16)) % part;
  }
  return res.toString();
};

/**
 * 将数组中相同数据分类，并统计出现次数
 * ```js
 * let arr = [ '1', '0', '2', '0', '2', '2', '1', '2', '1','0']
 * arrSameNumber(arr);
 * // res: { '0': 3, '1': 3, '2': 4 },
 * // keyLen: 3,
 * // KeyPartElementLen: { avg: 3, max: 4, min: 3 }
 *
 * // 100万 数据 运行测试结果 1000000
 {
  res: {
    '0': 99786,
    '1': 99858,
    '2': 100173,
    '3': 100025,
    '4': 99557,
    '5': 100035,
    '6': 100402,
    '7': 100031,
    '8': 99836,
    '9': 100297
  },
  keyLen: 10,
  KeyPartElementLen: { avg: 100000, max: 100402, min: 99557 }
}
 * ```
 * @param {Array} arr
 */
const arrSameNumber = arr => {
  let res = {};
  let keyArr;
  let keyLen;
  let KeyPartElementLen = {};
  for (let i = 0, l = arr.length; i < l; i++) {
    const item = arr[i];
    if (res[item]) {
      res[item] += 1;
      continue;
    }
    res[item] = 1;
  }
  keyArr = Object.keys(res);
  keyLen = keyArr.length;
  let temp = [];
  keyArr.map(val => {
    temp.push(res[val]);
  });
  temp.sort((a, b) => a - b);
  // eslint-disable-next-line no-eval
  KeyPartElementLen['avg'] = Math.floor(eval(temp.join('+')) / keyLen);
  KeyPartElementLen['max'] = temp.pop();
  KeyPartElementLen['min'] = temp.shift();
  return { res, keyLen, KeyPartElementLen, };
};

/**
 * 判断输入数据类型
 * @param {any} params
 */
const myType = params => {
  let ty = 'undefined';
  // try {
  ty = Object.prototype.toString.call(params);
  // } catch (error) {
  // return ty;
  // }
  let res = {
    '[object Object]': 'object',
    '[object Array]': 'array',
    '[object String]': 'string',
    '[object Null]': 'null',
    '[object Number]': 'number',
    '[object Undefined]': 'undefined',
    '[object Function]': 'function',
    '[object AsyncFunction]': 'function',
    '[object AsyncGeneratorFunction]': 'function',
    '[object GeneratorFunction]': 'function',
    '[object Boolean]': 'boolean',
    '[object Date]': 'date',
    '[object Location]': 'browser',
    '[object Navigator]': 'browser',
    '[object Window]': 'browser',
    '[object History]': 'browser',
    '[object Screen]': 'browser',
    // '[object HTMLDocument]': 'htmldocument',
    // '[object HTMLDivElement]': 'htmldiv',
    // '[object HTMLCollection]': 'htmltagname',
    // '[object HTMLAnchorElement]': 'htmla',
  };
  // global window
  if (/HTML/.test(ty)) return 'html';
  if (res[ty] !== 'number') return res[ty];
  return (
    {
      Infinity: 'infinity',
      NaN: 'nan',
    }[params.toString()] || res[ty]
  );
};

module.exports = {
  RegDoc,
  isUrl,
  checkObjProInArray,
  AveragePartAlg,
  arrSameNumber,
  myType,
};
