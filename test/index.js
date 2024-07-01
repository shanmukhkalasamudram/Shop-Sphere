/* eslint-disable no-undef */
/* eslint-disable global-require */
const { setupMongoMemoryServer } = require('./util/db');

const bootstrap = () => {
  describe('running test cases', () => {
    it('runs test cases for the project', async () => {
      // eslint-disable-next-line global-require
      await setupMongoMemoryServer();
      require('./test.spec.js');
    });
  });
};

bootstrap();
