import TestHelper from 'server-commons-tester';
import config from 'server-commons/config';
import powerRouter from 'server-commons/power.router';
import fs from 'fs';
import https from 'https';
import http from 'http';
import server from '../src/node';
import Sequelize, { Op } from 'sequelize';

import ProductDelivery from '../src/node/models/ProductDelivery';

const defaultConfig = { storeId: 1, userId: 514, scope: 'ADMIN' };
const requestConfig = { ...defaultConfig };
const testHelper = new TestHelper(server, config);

const sync = testHelper.sync;
testHelper.sync = async () => {
  await sync();
  testHelper.sync = () => {};
};

testHelper.setStore = storeId => requestConfig.storeId = storeId;
testHelper.setUser = userId => requestConfig.userId = userId;
testHelper.reset = () => {
  requestConfig.storeId = defaultConfig.storeId;
  requestConfig.userId = defaultConfig.userId;
  requestConfig.scope = defaultConfig.scope;
};
testHelper.readBase64 = file => new Buffer(fs.readFileSync(file))
  .toString('base64');
testHelper.downloadAsBase64 = url => (
  new Promise(((resolve, reject) => {
    let body = '';
    const protocol = url.indexOf('https') >= 0 ? https : http;
    protocol.get(url, resp => {
      resp.setEncoding('base64');
      resp.on('data', (data) => { body += data });
      resp.on('end', () => resolve(body));
    }).on('error', reject);
  }))
);

const clear = { force: true, where: { [Op.and]: [Sequelize.literal('1=1')]} };

testHelper.clearProductDeliveries = () => ProductDelivery.destroy(clear);

powerRouter.createInterceptor({
  intercepts: () => true,
  execute: async (parameters, req, res, stack) => {
    req.storeId = requestConfig.storeId;
    req.userId = requestConfig.userId;
    return stack.next();
  },
});

export default testHelper;
