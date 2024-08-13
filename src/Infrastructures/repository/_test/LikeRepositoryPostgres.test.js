const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UserCommentLikesTableTestHelper = require('../../../../tests/UserCommentLikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPosgres', () => {
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
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await UserCommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyLikeIsExist function', () => {
    it('shuld return 1 if like is found', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);
      await UserCommentLikesTableTestHelper.addLike({
        id: '123',
        user_id: 'user-123',
        comment_id: 'comment-456',
      });

      // Action
      const result = await likeRepositoryPostgres.verifyLikeIsExist('comment-456', 'user-123');

      // Assert
      expect(result).toBe(1);
    });
  });

  describe('addLike function', () => {
    it('should persist add like', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('comment-456', 'user-123');
      const addLike = await UserCommentLikesTableTestHelper.findLike(
        'user-123',
        'comment-456',
      );

      // Assert
      expect(addLike).toHaveLength(1);
      expect(addLike[0].user_id).toBe('user-123');
      expect(addLike[0].comment_id).toBe('comment-456');
    });
  });

  describe('deleteLike function', () => {
    it('should persist delete like', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      await UserCommentLikesTableTestHelper.addLike({
        id: '123',
        user_id: 'user-123',
        comment_id: 'comment-456',
      });

      // Action
      await likeRepositoryPostgres.deleteLike('comment-456', 'user-123');
      const result = await UserCommentLikesTableTestHelper.findLike(
        'user-123',
        'comment-456',
      );

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('countLike function', () => {
    it('should persist delete like', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await UserCommentLikesTableTestHelper.addLike({
        id: '123',
        user_id: 'user-123',
        comment_id: 'comment-456',
      });

      await UserCommentLikesTableTestHelper.addLike({
        id: '456',
        user_id: 'user-456',
        comment_id: 'comment-456',
      });

      // Action
      const result = await likeRepositoryPostgres.countLike('comment-456');

      // Assert
      expect(result).toBe('2');
    });
  });
});
