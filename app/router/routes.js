/*
 * @Author: shangyun.si
 * @Date: 2019-11-11 23:26:44
 * @Copyright(c) QuVideo F2E Team
 * @Email: shangyun.si@quvideo.com
 */

'use strict';
const { ctlSpec, ctlIndex, } = require('../controllers');

// 路由列表
// type ： url path 前缀； a或者缺省:/api; b:'/'; d:'/document'
const routeArray = [
  // project API
  {
    method: 'get',
    path: '/info',
    type: 'd',
    controller: ctlSpec.getApiInfo,
  },
  {
    method: 'get',
    path: '/',
    type: 'b',
    controller: ctlIndex.renderIndex,
  }, {
    method: 'get',
    path: '/register',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
  {
    method: 'get',
    path: '/list/user',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
  {
    method: 'get',
    path: '/list/collect',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
  {
    method: 'get',
    path: '/list/upgrade',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
  {
    method: 'get',
    path: '/list/experience',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
  {
    method: 'get',
    path: '/list/edit',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
  {
    method: 'get',
    path: '/list/download',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
  {
    method: 'get',
    path: '/list/pics/:tag?',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
  {
    method: 'get',
    path: '//list/detail/:id',
    type: 'b',
    controller: ctlIndex.renderIndex,
  },
];

module.exports = routeArray;
