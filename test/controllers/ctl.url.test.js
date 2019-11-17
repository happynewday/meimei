'use strict';

const mm = require('mm');
const should = require('should'); // eslint-disable-line
const supertest = require('supertest');
const { app, } = require('../../app');
const { partition, limit} = require('../../app/config/');

const assert = require('assert');
const { autoCrypto, createNonceStr, signOAuth, } = myCrypto;
const { isCode, AveragePartAlg, } = require('../../app/common/utils');
let { write, read, } = limit

const request = supertest(app.listen());

const doc = {
  uuid:'',
  url: '',
  csrfToken: ''
};
const urlOrigin = `https://www.baidu.com/s?wd=highsea#${createNonceStr()}`;
const pNum = AveragePartAlg(encodeURIComponent(urlOrigin), partition);

let pageUrl;
let reqHttpHeader;
let ipPort = /(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])+/

describe('短链服务', () => {

  it('获取页面-csrf_token', (done) => {
    request
      .get('/')
      .expect(200)
      .end((err, res) => {
        doc.csrfToken = res.header['x-request-csrf'];

        reqHttpHeader = res.req._header.split('\n');
        pageUrl = res.req.agent.protocol + '//' + ipPort.exec(reqHttpHeader[1])[0] + res.req.path;
        
        // console.log(res.req.agent.sockets);
        doc.csrfToken.should.be.a.String();
        done();
      });
  });

  it('新增短链(传输签名) - 成功', (done) => {
    let postData = {
      urlOrigin,
    }
    let queryStr = signQueryStr(doc.csrfToken, postData);
    console.log('~~queryStr~~', queryStr)

    request
      .post(`/api/url${queryStr}`)
      .set('Referer', pageUrl)
      .send(postData)
      .expect(200)
      .end((err, res) => {
        const { data, code } = res.body;
        console.log('\n---新增短链(传输签名) - 成功---', res.body)
        doc.uuid = data.uuid
        assert.deepStrictEqual(!!isCode(doc.uuid), true);

        let partNum = isCode(doc.uuid);
        // console.log(partNum, pNum)
        assert.deepStrictEqual(partNum, pNum);

        code.should.equal(20000);
        done();
      });
  });

  it('获取页面-限流控制', (done) => {
    request
      .get('/')
      .set('Referer', pageUrl)
      .expect(200)
      .end((err, res) => {
        let csrfToken = res.header['x-request-csrf'];
        console.log('--新 %s ；旧 %s --', csrfToken, doc.csrfToken, )

        assert.deepStrictEqual(doc.csrfToken !== csrfToken, true)
        doc.csrfToken = csrfToken;
        doc.total = res.header['x-rate-limit-limit'];
        doc.remaining = res.header['x-rate-limit-remaining'];
        doc.reset = new Date(res.header['x-rate-limit-reset'])
        doc.reset.should.be.an.instanceOf(Date);
        should(doc).have.property('total', read.max+'');
        // assert.deepStrictEqual(doc.remaining, (read.max-2)+'');
        done();
      });
  });

  // ============================================================
  // TODO 该部分测试 放到 ratelimit-checkreq 模块中处理
  // ============================================================
  it('接口请求失败-API签名参数-csrf_token', (done) => {
    request
      .post('/api/url')
      // .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        // ratelimit-checkreq
        // 21011, `opt 配置错误，默认 ${APIauth.options}`
        // 21002, 'csrf_token 参数丢失，请求非法'
        // 21003, 'nonce_str 随机字符串是必须的，用于生成sign核实调用方'
        // 21004, 'sign 是必须的，用于服务端核实调用方'
        // 21007, `请求没有在规定的时间（ ${csrf.expires} 秒）到达服务端`
        // 21005, '获取 csrf_token 不存在 - 检查csrf是否正确，或已经被使用'
        // 21006, `csrf_token 已经过期 - 当前设置为：${csrf.expires / 60} 分钟`
        // 21008, '参数签名不正确'
        // 21009, '清除 csrf_token 失败请重试'
        res.body.code.should.equal(21002);
        done();
      });
  });

  it('接口请求失败-API签名参数 1.1-nonce_str', (done) => {
    request
      .post('/api/url?token=111')
      // .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        res.body.code.should.equal(21003);
        // ?token=ZBKsXizgnfcI5xTYPTymXcsetT4&openid=72f94ca890e7b18c9d5ae7c182900c0d&nonce_str=3owfcau7s3l&timestamp=1558092291458&sign=43de53f42b9dd9408e919939e64bd48e
        done();
      });
  });
  it('接口请求失败-API签名参数 1.2-openid-是必须传的', (done) => {
    request
      .post(`/api/url?token=111&nonce_str=111`)
      // .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        res.body.code.should.equal(21014);
        done();
      });
  });
  it('接口请求失败-API签名参数 1.3-timestamp', (done) => {
    request
      .post('/api/url?token=111&nonce_str=111&openid=333')
      // .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        res.body.code.should.equal(21007);
        done();
      });
  });
  it('接口请求失败-API签名参数 1.4-sign', (done) => {
    request
      .post('/api/url?token=111&nonce_str=111&openid=333&timestamp=1558092291458')
      // .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        res.body.code.should.equal(21004);
        done();
      });
  });
  it('接口请求失败-API签名参数 2-请求必须在规定时间内到达', (done) => {
    request
      .post('/api/url?token=111&nonce_str=111&openid=333&timestamp=1558092291458&sign=222')
      // .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        res.body.code.should.equal(21007);
        done();
      });
  });
  it('接口请求失败-API签名参数 3,4-参数签名sign错误', (done) => {
    request
      .post(`/api/url?token=${doc.csrfToken}&nonce_str=111&openid=333&timestamp=${Date.now()}&sign=222`)
      // .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        res.body.code.should.equal(21008);
        // pageCsrf()
        done();
      });
  });

  it('接口请求失败-API签名参数 5-csrf正确性检查-错误', (done) => {
    let str = signStr({
      token: 111,
      nonce_str: 222,
      openid: 333,
      timestamp: Date.now(),
      playload: {},
    })
    request
      .post(`/api/url${str}`)
      // .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        res.body.code.should.equal(21005);
        done();
      });
  });

  it('接口请求失败-API签名参数 5.1-Referer信息伪造-错误', (done) => {
    let str = signStr({
      token: doc.csrfToken,
      nonce_str: 222,
      openid: 333,
      timestamp: Date.now(),
      playload: {},
    })
    request
      .post(`/api/url${str}`)
      .set('Referer', '000')
      .expect(200)
      .end((err, res) => {
        res.body.code.should.equal(21012);
        done();
      });
  });
  // todo: csrf_token 已经过期

  // ============================================================
  // TODO 该部分测试 放到 ratelimit-checkreq 模块中处理 end
  // ============================================================

  it('新增短链-失败: 参数丢失', (done) => {
    let postData = { test : 1 };
    let queryStr = signQueryStr(doc.csrfToken, postData);
    request
      .post(`/api/url${queryStr}`)
      .set('Referer', pageUrl)
      .send(postData)
      .expect(200)
      .end((err, res) => {
        const { data, code , message, } = res.body;
        assert.deepStrictEqual(/urlOrigin/.test(message), true);
        code.should.equal(20001);
        done();
      });
  });

  it('查询短链 API - 失败 csrf_token 已经被使用', (done) => {
    let playload = {};
    let queryStr = signQueryStr(doc.csrfToken, playload);
    request
      .get(`/api/${doc.uuid}${queryStr}`)
      .set('Referer', pageUrl)
      .expect(200)
      .end((err, res) => {
        const { data, code, message, } = res.body;
        console.log(res.body);
        code.should.equal(21005);
        done();
      });
  });

  it('获取页面-限流控制-继续校验次数', (done) => {
    request
      .get('/')
      .set('Referer', pageUrl)
      .expect(200)
      .end((err, res) => {
        let csrfToken = res.header['x-request-csrf'];
        console.log('～～新 %s ；～～ 旧 %s ～～', csrfToken, doc.csrfToken)

        assert.deepStrictEqual(doc.csrfToken !== csrfToken, true)
        doc.csrfToken = csrfToken;
        doc.total = res.header['x-rate-limit-limit'];
        doc.remaining = res.header['x-rate-limit-remaining'];
        doc.reset = new Date(res.header['x-rate-limit-reset'])
        doc.reset.should.be.an.instanceOf(Date);
        should(doc).have.property('total', read.max+'');
        // assert.deepStrictEqual(doc.remaining, (read.max-3)+'');
        done();
      });
  });

  // it('查询短链 重定向 - 成功', (done) => {
  //   request
  //     .get(`/${doc.uuid}`)
  //     .expect(302, done)
  // });

  it('查询短链 重定向 - 成功 - location校验', (done) => {
    request
      .get(`/${doc.uuid}`)
      .set('Referer', pageUrl)
      .expect(302)
      .end((err, res) => {
        console.log(res.header.location)
        assert.deepStrictEqual(res.header.location, urlOrigin)
        done()
      })
  });

  it('查询短链 API - 成功', (done) => {
    let playload = {};
    let queryStr = signQueryStr(doc.csrfToken, playload);
    request
      .get(`/api/${doc.uuid}${queryStr}`)
      .set('Referer', pageUrl)
      .expect(200)
      .end((err, res) => {
        const { data, code, message, } = res.body;
        console.log(data)
        should(data).have.property('action', 2);
        should(data).have.property('url', encodeURIComponent(urlOrigin));
        assert.deepStrictEqual(data.uuid, doc.uuid);
        code.should.equal(20000);
        done();
      });
  });

  it('查询短链 重定向 - 失败 - Code不符合规范 (尾号与位数校验)', (done)=>{
    request
      .get(`/abc1`)
      .set('Referer', pageUrl)
      .expect(200)
      .end((err, res) => {
        assert.deepStrictEqual(/20004/.test(res.text), true)
        done()
      });
  })

  it('查询短链 重定向 - 失败 - Code不符合规范（尾号非数字）', (done) => {
    request
      .get(`/abcdef`)
      .set('Referer', pageUrl)
      .expect(200)
      .end((err, res) => {
        // console.log(res)
        assert.deepStrictEqual(/20004/.test(res.text), true);
        done()
      });
  })

  it('查询短链 重定向 - 失败 - 查询的短链Code不存在 ', (done) => {
    request
      .get(`/abcde1`)
      .set('Referer', pageUrl)
      .expect(200)
      .end((err, res) => {
        assert.deepStrictEqual(/20003/.test(res.text), true);
        done()
      });
  })

  

  it('再次获取新的 scrf_token ', pageCsrf);

  it('新增短链(传输签名) - 已经生成过了', (done) => {
    let postData = {
      urlOrigin,
    }
    let queryStr = signQueryStr(doc.csrfToken, postData);
    request
      .post(`/api/url${queryStr}`)
      .set('Referer', pageUrl)
      .send(postData)
      .expect(200)
      .end((err, res) => {
        const { data, code } = res.body;
        console.log('\n==== 新增短链(传输签名) - 已经生成过了 ====', res.body)
        should(data).have.property('action', 2);
        assert.deepStrictEqual(data.uuid, doc.uuid);
        code.should.equal(20000);
        done();
      });
  });
  
  it('正常路由访问～非code - 跳转route', (done) => {
    request
      .get(`/assets/browser-mycrypto.js`)
      .set('Referer', pageUrl)
      .expect(200, done)
  });

  // it('删除短链code记录', async()=>{
  //   let mysqlConf = JSON.parse(JSON.stringify(config.mysql));
  //   let con = new  MysqlExt(mysqlConf);
  //   let res = await con.query(`DELETE from base_short_url WHERE \`uuid\` = '${doc.uuid}';`);
  //   res.affectedRows.should.equal(1);
  // })

  

});


function signStr(queryDoc){
  let signObj = signOAuth(queryDoc, true);
  queryDoc['sign'] = signObj.sign;
  delete queryDoc.playload;
  let queryStr = '';
  Object.keys(queryDoc).map(item => {
    queryStr += '&' + item + '=' + queryDoc[item]
  })
  queryStr = queryStr.replace(/&/, '?');
  return queryStr;
}

function signQueryStr(token, playload) {
  let queryDoc = {
    token,
    openid: autoCrypto('ua + * + page-url'),
    nonce_str: createNonceStr(),
    timestamp: Date.now(),
    playload,
  }
  return signStr(queryDoc)
}

function pageCsrf(done) {
  request
    .get('/')
    .expect(200)
    .end((err, res) => {
      let csrfToken = res.header['x-request-csrf'];
      console.log('--新 %s ；旧 %s --', csrfToken, doc.csrfToken)
      doc.csrfToken = csrfToken;
      done();
    });
}