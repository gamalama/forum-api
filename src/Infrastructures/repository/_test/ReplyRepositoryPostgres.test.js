const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });

    await UsersTableTestHelper.addUser({
      id: 'user-456',
      username: 'fakhry',
      password: 'rahasia',
      fullname: 'Fakhry Dicoding',
    });

    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'New Thread 123',
      body: 'New thread body 123.',
      owner: 'user-123',
      created_at: '2024-06-10T17:14:31.573Z',
      updated_at: '2024-06-10T17:14:31.573Z',
    });

    // user-456 add comment comment-456
    await CommentsTableTestHelper.addComment({
      id: 'comment-456',
      content: 'New Comment from user-456',
      thread: 'thread-123',
      owner: 'user-456',
      is_delete: false,
      created_at: '2024-05-10T17:15:31.573Z',
      updated_at: '2024-05-10T17:15:31.573Z',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyComment function', () => {
    it('should return rows correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const result = await replyRepositoryPostgres.verifyComment('comment-456');
      // Action & Assert
      await expect(result.rows.length).toEqual(1);
    });
  });

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      // Arrange
      const addReply = new AddReply({ content: 'New Reply' });
      const fakeIdGenerator = () => '456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(addReply, 'comment-456', 'user-123');

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-456');

      expect(reply).toHaveLength(1);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should return rows correctly', async () => {
      // Arrange
      const addReply = new AddReply({ content: 'New Reply' });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(
        addReply,
        'comment-456',
        'user-456',
      );

      // Action
      const result = await replyRepositoryPostgres.verifyReplyOwner('user-456', 'reply-123');
      await expect(result.rowCount).toEqual(1);
    });
  });

  describe('deleteReply function', () => {
    it('should return 0 rowCount when reply not found', async () => {
    // Arrange
      const addReply = new AddReply({ content: 'New Reply' });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(addReply, 'comment-456', 'user-456');

      // Action & Assert
      const result = await replyRepositoryPostgres.deleteReply('reply-456');
      await expect(result.rowCount).toEqual(0);
    });

    it('should persist delete reply', async () => {
    // Arrange
      const addReply = new AddReply({ content: 'New Reply' });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(addReply, 'comment-456', 'user-456');

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replyDeleted = await RepliesTableTestHelper.findReplyById('reply-123');

      expect(replyDeleted[0].is_delete).toEqual(true);
    });
  });
});
