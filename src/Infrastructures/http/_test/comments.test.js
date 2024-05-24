const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST comemnt', () => {
    it('should response 201 and persistent comment', async () => {
      // Add User for adding thread
      const server = await createServer(container);
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Add thread
      const addThreadPayload = {
        title: 'New Thread 123',
        body: 'New Thread body.',
      };
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: addThreadPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      console.log(threadId);

      // Arrange
      const requestPayload = {
        content: 'New Comment 456',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      console.log(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });
});
