const app = require('../src/app');
const request = require('supertest');
const { expect } = require('chai');


describe('Test cases for Profile', () => {
    before(async () => {
        //Before Hook
    });

    after(async () => {
        //After Hook
    });

    it('[GET] Test API ', async () => {
        const response = await request(app)
            .get(`/api/v1/test`)
            .send();
        expect(response.body.is_success).to.be.true;
    });
});