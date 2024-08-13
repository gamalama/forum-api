const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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

    await RepliesTableTestHelper.addReply({
      id: 'reply-789',
      content: 'New reply 456',
      comment: 'comment-456',
      owner: 'user-123',
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

  describe('getReplies function', () => {
    it('should return reply result rows correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      const replies = await replyRepositoryPostgres.getReplies('comment-456');
      const user = await UsersTableTestHelper.findUsersById('user-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBe('reply-789');
      expect(replies[0].content).toBe('New reply 456');
      expect(replies[0].updated_at).toBe('2024-05-10T17:15:31.573Z');
      expect(replies[0].username).toBe(user[0].username);
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
      const reply = await RepliesTableTestHelper.findReplyById('reply-456');

      // Assert
      expect(reply).toHaveLength(1);
      expect(reply[0].id).toBe('reply-456');
      expect(reply[0].content).toBe('New Reply');
      expect(reply[0].comment).toBe('comment-456');
      expect(reply[0].owner).toBe('user-123');
      expect(reply[0].is_delete).toBe(false);
      expect(reply[0].created_at).toBeDefined();
      expect(reply[0].updated_at).toBeDefined();
    });
  });

  describe('verifyReplyIsExist function', () => {
    it('should throw error when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await RepliesTableTestHelper.addReply({
        id: 'reply-008',
        content: 'New reply 456',
        comment: 'comment-456',
        owner: 'user-123',
        is_delete: false,
        created_at: '2024-05-10T17:15:31.573Z',
        updated_at: '2024-05-10T17:15:31.573Z',
      });

      // Action
      await expect(replyRepositoryPostgres.verifyReplyIsExist('reply-007'))
        .rejects.toThrowError(new NotFoundError('balasan tidak ditemukan'));
    });

    it('should not throw error when reply found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await RepliesTableTestHelper.addReply({
        id: 'reply-008',
        content: 'New reply 456',
        comment: 'comment-456',
        owner: 'user-123',
        is_delete: false,
        created_at: '2024-05-10T17:15:31.573Z',
        updated_at: '2024-05-10T17:15:31.573Z',
      });

      // Action
      await expect(replyRepositoryPostgres.verifyReplyIsExist('reply-008'))
        .resolves.not.toThrowError(new NotFoundError('balasan tidak ditemukan'));
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw error when user have no rights', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await RepliesTableTestHelper.addReply({
        id: 'reply-008',
        content: 'New reply 456',
        comment: 'comment-456',
        owner: 'user-123',
        is_delete: false,
        created_at: '2024-05-10T17:15:31.573Z',
        updated_at: '2024-05-10T17:15:31.573Z',
      });

      // Action
      await expect(replyRepositoryPostgres.verifyReplyOwner('user-456', 'reply-008'))
        .rejects.toThrowError(new AuthorizationError('tidak berhak menghapus balasan'));
    });

    it('should not throw error when user have rights', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await RepliesTableTestHelper.addReply({
        id: 'reply-008',
        content: 'New reply 456',
        comment: 'comment-456',
        owner: 'user-123',
        is_delete: false,
        created_at: '2024-05-10T17:15:31.573Z',
        updated_at: '2024-05-10T17:15:31.573Z',
      });

      // Action
      await expect(replyRepositoryPostgres.verifyReplyOwner('user-123', 'reply-008'))
        .resolves.not.toThrowError(new AuthorizationError('tidak berhak menghapus balasan'));
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
