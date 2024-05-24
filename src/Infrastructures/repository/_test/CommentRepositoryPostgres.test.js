const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

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

  describe('verifyThread function', () => {
    it('should throw InvariantError when thread not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThread('thread-999')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw InvariantError when thread available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThread('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, 'thread-123', 'user-123');

      // Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('user-456', 'comment-456'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when user have no rights', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, 'thread-123', 'user-123');

      // Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('user-456', 'comment-123'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user have rights', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, 'thread-123', 'user-123');

      // Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('user-123', 'comment-123'))
        .resolves.not.toThrow(AuthorizationError);
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
    });

    it('should return comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment' });
      const fakeIdGenerator = () => '456';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        addComment,
        'thread-123',
        'user-456',
      );

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-456',
        content: 'New Comment',
        owner: 'user-456',
      }));
    });
  });

  describe('deleteComment', () => {
    it('should throw NotFound Error when comment not found', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'New Comment will be deleted' });
      const fakeIdGenerator = () => '456';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(addComment, 'thread-123', 'user-456');

      // Action
      await expect(commentRepositoryPostgres.deleteComment('comment-789'))
        .rejects.toThrowError(NotFoundError);
    });

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
