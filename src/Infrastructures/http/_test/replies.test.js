const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST replies', () => {
    it('should response 200 and reply deleted async', async () => {
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

      // Add user for adding reply
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'arsene',
          password: 'rahasia123',
          fullname: 'Arsene Tsaqeev',
        },
      });

      const loginUserThreePayload = {
        username: 'arsene',
        password: 'rahasia123',
      };
      const loginUserThreeResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginUserThreePayload,
      });

      const { accessToken: accessTokenUserThree } = JSON.parse(loginUserThreeResponse.payload).data;

      // Add reply
      const replyPayload = {
        content: 'New Reply for Comment 123',
      };

      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers: { Authorization: `Bearer ${accessTokenUserThree}` },
      });

      const replyId = JSON.parse(addReplyResponse.payload).data.addedReply.id;

      const deleteReplyResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessTokenUserThree}` },
      });

      const responseJson = JSON.parse(deleteReplyResponse.payload);
      expect(deleteReplyResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 201 and persistent reply', async () => {
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

      // Add user for adding reply
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'arsene',
          password: 'rahasia123',
          fullname: 'Arsene Tsaqeev',
        },
      });

      const loginUserThreePayload = {
        username: 'arsene',
        password: 'rahasia123',
      };
      const loginUserThreeResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginUserThreePayload,
      });

      const { accessToken: accessTokenUserThree } = JSON.parse(loginUserThreeResponse.payload).data;

      // Arrange
      const requestPayload = {
        content: 'New Reply for Comment 123',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenUserThree}` },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });
});
