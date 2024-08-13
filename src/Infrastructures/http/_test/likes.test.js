const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UserCommentLikesTableTestHelper = require('../../../../tests/UserCommentLikesTableTestHelper');

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UserCommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when PUT likes', () => {
    it('should response 200 when add like', async () => {
      const server = await createServer(container);

      // Add user for adding thread
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

      // Add user for adding comment
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fakhry',
          password: 'secret123',
          fullname: 'Fakhry Linux',
        },
      });

      const loginUserTwoPayload = {
        username: 'fakhry',
        password: 'secret123',
      };
      const loginUserTwoResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginUserTwoPayload,
      });
      const { accessToken: accessTokenUserTwo } = JSON.parse(loginUserTwoResponse.payload).data;

      // Add comment
      const addCommentPayload = {
        content: 'New Comment 123',
      };

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: addCommentPayload,
        headers: { Authorization: `Bearer ${accessTokenUserTwo}` },
      });

      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Add like
      const addLikeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(addLikeResponse.payload);
      expect(addLikeResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when delete like', async () => {
      const server = await createServer(container);

      // Add user for adding thread
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

      // Add user for adding comment
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fakhry',
          password: 'secret123',
          fullname: 'Fakhry Linux',
        },
      });

      const loginUserTwoPayload = {
        username: 'fakhry',
        password: 'secret123',
      };
      const loginUserTwoResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginUserTwoPayload,
      });
      const { accessToken: accessTokenUserTwo } = JSON.parse(loginUserTwoResponse.payload).data;

      // Add comment
      const addCommentPayload = {
        content: 'New Comment 123',
      };

      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: addCommentPayload,
        headers: { Authorization: `Bearer ${accessTokenUserTwo}` },
      });

      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Add like
      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Delete like
      const deleteLikeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(deleteLikeResponse.payload);
      expect(deleteLikeResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
