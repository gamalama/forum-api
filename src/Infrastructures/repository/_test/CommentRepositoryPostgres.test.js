const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require(
  '../../../Commons/exceptions/AuthorizationError',
);

describe('CommentRepositoryPostgres', () => {
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
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('verifyCommentIsExist function', () => {
    it('should throw error when comment not found', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, 'thread-123', 'user-123');
      // const result = await commentRepositoryPostgres.verifyComment('comment-123');

      // Assert
      const verifyCommentIsExist = async () => commentRepositoryPostgres.verifyCommentIsExist('comment-456');
      await expect(verifyCommentIsExist)
        .rejects
        .toThrowError(new NotFoundError('komentar tidak ditemukan'));
    });

    it('should not throw error', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, 'thread-123', 'user-123');

      // Assert
      await expect(() => commentRepositoryPostgres.verifyCommentIsExist('comment-123'))
        .not.toThrowError(new NotFoundError('komentar tidak ditemukan'));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw error NotFoundError', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'New Comment from user-456',
        thread: 'thread-123',
        owner: 'user-123',
        is_delete: false,
        created_at: '2024-05-10T17:15:31.573Z',
        updated_at: '2024-05-10T17:15:31.573Z',
      });

      // Assert
      await expect(() => commentRepositoryPostgres.verifyCommentOwner('user-123', 'comment-001'))
        .rejects.toThrowError(new NotFoundError('komentar tidak ditemukan'));
    });

    it('should throw error AuthorizationError', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'New Comment from user-456',
        thread: 'thread-123',
        owner: 'user-123',
        is_delete: false,
        created_at: '2024-05-10T17:15:31.573Z',
        updated_at: '2024-05-10T17:15:31.573Z',
      });

      // Assert
      await expect(() => commentRepositoryPostgres.verifyCommentOwner('user-001', 'comment-123'))
        .rejects.toThrowError(new AuthorizationError('tidak berhak menghapus komentar'));
    });

    it('should not throw error NotFoundError', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'New Comment from user-456',
        thread: 'thread-123',
        owner: 'user-123',
        is_delete: false,
        created_at: '2024-05-10T17:15:31.573Z',
        updated_at: '2024-05-10T17:15:31.573Z',
      });

      // Assert
      await expect(() => commentRepositoryPostgres.verifyCommentOwner('user-123', 'comment-123'))
        .not.toThrowError(new NotFoundError('komentar tidak ditemukan'));
    });

    it('should not throw error AuthorizationError', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'New Comment from user-456',
        thread: 'thread-123',
        owner: 'user-123',
        is_delete: false,
        created_at: '2024-05-10T17:15:31.573Z',
        updated_at: '2024-05-10T17:15:31.573Z',
      });

      // Assert
      await expect(() => commentRepositoryPostgres.verifyCommentOwner('user-123', 'comment-123'))
        .not.toThrowError(new AuthorizationError('tidak berhak menghapus komentar'));
    });
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment' });
      const fakeIdGenerator = () => '456';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, 'thread-123', 'user-456');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-456');
      expect(comment).toHaveLength(1);
      expect(comment[0].id).toBe('comment-456');
      expect(comment[0].content).toBe('New Comment');
      expect(comment[0].owner).toBe('user-456');
    });
  });

  describe('deleteComment', () => {
    it('should persist delete comment', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment will be deleted' });
      const fakeIdGenerator = () => '456';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(addComment, 'thread-123', 'user-456');

      // Action
      await commentRepositoryPostgres.deleteComment('comment-456');

      // Assert
      const commentDeleted = await CommentsTableTestHelper.findCommentById('comment-456');

      expect(commentDeleted[0].is_delete).toEqual(true);
    });
  });
});
