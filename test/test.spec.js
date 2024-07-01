const app = require('../src/app');
const request = require('supertest');
const { expect } = require('chai');

describe('Test cases for Profile', () => {
  before(async () => {
    //Before Hook
    console.log('before');
  });

  after(async () => {
    //After Hook
    console.log('After');
  });

  it('[GET] Test API ', async () => {
    const response = await request(app).get(`/api/v1/test`).send();
    expect(response.body.is_success).to.be.true;
  });
});
