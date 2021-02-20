import TestHelper from './test.helper';
import nock from 'nock';
import config from 'server-commons/config';

const { http, expect, setStore } = TestHelper;
const { get, post, put } = http;

const URL = '/';

export const createProductDelivery = async productDelivery => {
  const mock = nock(`https://maps.googleapis.com`);
  mock.get('/maps/api/geocode/json?address=Av+Brigadeiro+Faria+Lima,+123,+S%C3%A3o+Paulo,+SP&key=T0K3N').reply(200, require('./responses/google_maps_response.json'));

  const mockLoggi = nock(`https://www.loggi.com.br`);
  mockLoggi.post('/graphql/?query=getShop', body => {
    expect(body).to.have.property('variables');
    expect(body.variables).to.have.property('shopId').equal(config.get('LOGGI_SHOP_ID'));
    return true;
  }).reply(200, require('./responses/loggi_shop_response.json'));

  mockLoggi.post('/graphql/?query=createOrder', body => {
    expect(body).to.have.property('variables');
    expect(body.variables).to.have.property('packages');

    const { packages } = body.variables;

    expect(packages).with.length(1);
    expect(packages[0]).to.have.property('pickupIndex').equal(0);
    expect(packages[0]).to.have.property('recipient');
    expect(packages[0]).to.have.property('address');
    expect(packages[0].recipient).to.have.property('name').equal(productDelivery.user.fullName);
    expect(packages[0].recipient).to.have.property('email').equal(productDelivery.user.email);
    expect(packages[0].recipient).to.have.property('phone').equal(productDelivery.user.phone);

    expect(packages[0].address).to.have.property('lat').equal(-23.5603606);
    expect(packages[0].address).to.have.property('lng').equal(-46.6954915);
    expect(packages[0].address).to.have.property('address').equal('Av. Brg. Faria Lima, 123 - Pinheiros, São Paulo - SP, 05426-100, Brasil');
    return true;
  }).reply(200, require('./responses/loggi_response.json'));

  let response = await post('/', productDelivery);
  response.should.have.status(200);
  expect(response.body).to.have.property('id');
};

export const productDelivery = {
  userId: 18948,
  orderId: 9435,
  status: 1,
  delivered: false,
  user: {
    id: 18948,
    fullName: 'John Doe',
    email: 'johndoe@example.com',
    phone: '11998832157'
  },
  address: {
    tokenId: '12y8h9d1h89gd',
    zipCode: '58046135',
    address: 'Av Brigadeiro Faria Lima',
    addressNumber: '123',
    addressNumberComp: 'Apt 101',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    userConfirmedMainAddress: true,
    mainAddress: true
  },
  products: [
    {
      id: 3842,
      name: 'Cesar Salad',
      image: 'https://awsapps.com/salad.png',
      quantity: 1
    }
  ],
  order: {
    id: 9435
  },
  deliveryEstimateDate: '2020-03-23T11:35:59.000Z',
};

describe('Product Delivery', () => {
  before(() => TestHelper.sync());
  beforeEach(() => TestHelper.reset());
  beforeEach(() => TestHelper.clearProductDeliveries());

  it('should create and return list', async () => {
    setStore(1);

    let response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(0);

    await createProductDelivery(productDelivery);
    response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(1);

    expect(response.body[0]).to.have.property('id');
    expect(response.body[0]).to.have.property('userId').equal(productDelivery.userId);
    expect(response.body[0]).to.have.property('orderId').equal(productDelivery.orderId);
    expect(response.body[0]).to.have.property('status').equal(productDelivery.status);
    expect(response.body[0]).to.have.property('delivered').equal(productDelivery.delivered);
    expect(response.body[0]).to.have.property('deliveryEstimateDate').equal(productDelivery.deliveryEstimateDate);
    expect(response.body[0]).to.have.property('loggiOrderId').equal(4984534);
    expect(response.body[0]).to.have.property('loggiOrderUrl').equal('https://www.loggi.com/track/4984534');

    expect(response.body[0]).to.have.property('latitude').equal(-23.5603606);
    expect(response.body[0]).to.have.property('longitude').equal(-46.6954915);
    expect(response.body[0]).to.have.property('formattedAddress').equal('Av. Brg. Faria Lima, 123 - Pinheiros, São Paulo - SP, 05426-100, Brasil');

    expect(response.body[0]).to.have.property('user');
    expect(response.body[0].user).to.have.property('id').equal(productDelivery.user.id);
    expect(response.body[0].user).to.have.property('fullName').equal(productDelivery.user.fullName);
    expect(response.body[0].user).to.have.property('email').equal(productDelivery.user.email);
    expect(response.body[0].user).to.have.property('phone').equal(productDelivery.user.phone);

    expect(response.body[0]).to.have.property('address');
    expect(response.body[0].address).to.have.property('tokenId').equal(productDelivery.address.tokenId);
    expect(response.body[0].address).to.have.property('zipCode').equal(productDelivery.address.zipCode);
    expect(response.body[0].address).to.have.property('address').equal(productDelivery.address.address);
    expect(response.body[0].address).to.have.property('addressNumber').equal(productDelivery.address.addressNumber);
    expect(response.body[0].address).to.have.property('addressNumberComp').equal(productDelivery.address.addressNumberComp);
    expect(response.body[0].address).to.have.property('neighborhood').equal(productDelivery.address.neighborhood);
    expect(response.body[0].address).to.have.property('city').equal(productDelivery.address.city);
    expect(response.body[0].address).to.have.property('state').equal(productDelivery.address.state);
    expect(response.body[0].address).to.have.property('country').equal(productDelivery.address.country);
    expect(response.body[0].address).to.have.property('userConfirmedMainAddress').equal(productDelivery.address.userConfirmedMainAddress);
    expect(response.body[0].address).to.have.property('mainAddress').equal(productDelivery.address.mainAddress);

    expect(response.body[0]).to.have.property('products').with.length(1);
    expect(response.body[0].products[0]).to.have.property('id').equal(productDelivery.products[0].id);
    expect(response.body[0].products[0]).to.have.property('name').equal(productDelivery.products[0].name);
    expect(response.body[0].products[0]).to.have.property('image').equal(productDelivery.products[0].image);
  });

  it('should filter by store', async () => {
    setStore(1);

    let response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(0);

    await createProductDelivery(productDelivery);

    response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(1);

    setStore(2);

    response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(0);

    await createProductDelivery(productDelivery);

    response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(1);
  });

  it('should create then update address', async () => {
    setStore(1);

    let response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(0);

    await createProductDelivery(productDelivery);
    response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(1);

    const newAddress = {
      tokenId: '1242f1f',
      zipCode: '69310-000',
      address: 'Avenida Capitão Ene Garcez',
      addressNumber: '321',
      addressNumberComp: 'Apt 301',
      neighborhood: 'Aeroporto',
      city: 'Boa Vista',
      state: 'RR',
      country: 'Brasil',
      userConfirmedMainAddress: true,
      mainAddress: true
    };

    const mock = nock(`https://maps.googleapis.com`);
    mock.get('/maps/api/geocode/json?address=Avenida+Capit%C3%A3o+Ene+Garcez,+321,+Boa+Vista,+RR&key=T0K3N').reply(200, require('./responses/google_maps_2_response.json'));

    response = await put(`/updateAddress/${productDelivery.orderId}?userId=${productDelivery.userId}`, newAddress);
    response.should.have.status(200);

    response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(1);

    expect(response.body[0]).to.have.property('address');
    expect(response.body[0].address).to.have.property('tokenId').equal(newAddress.tokenId);
    expect(response.body[0].address).to.have.property('zipCode').equal(newAddress.zipCode);
    expect(response.body[0].address).to.have.property('address').equal(newAddress.address);
    expect(response.body[0].address).to.have.property('addressNumber').equal(newAddress.addressNumber);
    expect(response.body[0].address).to.have.property('addressNumberComp').equal(newAddress.addressNumberComp);
    expect(response.body[0].address).to.have.property('neighborhood').equal(newAddress.neighborhood);
    expect(response.body[0].address).to.have.property('city').equal(newAddress.city);
    expect(response.body[0].address).to.have.property('state').equal(newAddress.state);
    expect(response.body[0].address).to.have.property('country').equal(newAddress.country);
    expect(response.body[0].address).to.have.property('userConfirmedMainAddress').equal(newAddress.userConfirmedMainAddress);
    expect(response.body[0].address).to.have.property('mainAddress').equal(newAddress.mainAddress);

    expect(response.body[0]).to.have.property('latitude').equal(2.8345939);
    expect(response.body[0]).to.have.property('longitude').equal(-60.68915259999999);
    expect(response.body[0]).to.have.property('formattedAddress').equal('Av. Cap. Ene Garcês, 321 - Centro, Boa Vista - RR, 69304, Brasil');
  });

  it('should create then change status', async () => {
    setStore(1);

    let response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(0);

    await createProductDelivery(productDelivery);
    response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(1);
    expect(response.body[0]).to.have.property('status').equal(productDelivery.status);

    const { id } = response.body[0];
    const newStatus = 2;

    response = await put(`/changeStatus`, { listOfIds: [id], status: newStatus });
    response.should.have.status(200);

    response = await get(URL);
    response.should.have.status(200);
    expect(response.body).with.length(1);
    expect(response.body[0]).to.have.property('status').equal(newStatus);
  });

  it('should check if can deliver', async () => {
    setStore(1);

    const mock = nock(`https://maps.googleapis.com`);
    mock.get('/maps/api/geocode/json?address=Av+Brigadeiro+Faria+Lima,+123,+S%C3%A3o+Paulo,+SP&key=T0K3N').reply(200, require('./responses/google_maps_response.json'));

    const mockLoggi = nock(`https://www.loggi.com.br`);
    mockLoggi.post('/graphql/?query=getShop', body => {
      expect(body).to.have.property('variables');
      expect(body.variables).to.have.property('shopId').equal(config.get('LOGGI_SHOP_ID'));
      return true;
    }).reply(200, require('./responses/loggi_shop_response.json'));

    let response = await post('/checkDelivery', {
      tokenId: '12y8h9d1h89gd',
      zipCode: '58046135',
      address: 'Av Brigadeiro Faria Lima',
      addressNumber: '123',
      addressNumberComp: 'Apt 101',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      userConfirmedMainAddress: true,
      mainAddress: true
    });
    response.should.have.status(200);
    expect(response.body).to.have.property('canDeliver').equal(true);

    mock.get('/maps/api/geocode/json?address=Avenida+Capit%C3%A3o+Ene+Garcez,+321,+Boa+Vista,+RR&key=T0K3N').reply(200, require('./responses/google_maps_2_response.json'));
    mockLoggi.post('/graphql/?query=getShop', body => {
      expect(body).to.have.property('variables');
      expect(body.variables).to.have.property('shopId').equal(config.get('LOGGI_SHOP_ID'));
      return true;
    }).reply(200, require('./responses/loggi_shop_response.json'));

    response = await post('/checkDelivery', {
      tokenId: '1242f1f',
      zipCode: '69310-000',
      address: 'Avenida Capitão Ene Garcez',
      addressNumber: '321',
      addressNumberComp: 'Apt 301',
      neighborhood: 'Aeroporto',
      city: 'Boa Vista',
      state: 'RR',
      country: 'Brasil',
      userConfirmedMainAddress: true,
      mainAddress: true
    });
    response.should.have.status(200);
    expect(response.body).to.have.property('canDeliver').equal(false);
  });

});
