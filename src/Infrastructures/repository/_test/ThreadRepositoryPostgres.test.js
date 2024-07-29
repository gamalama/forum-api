const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentedThread = require('../../../Domains/threads/entities/CommentedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser(
      {
        id: 'user-456',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    );
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

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'New Thread',
        body: 'New Thread body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread, 'user-456');

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });
  });

  describe('getThread function', () => {
    it('should persist get thread', async () => {
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      /** Add thread */
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'New Thread 123',
        body: 'New thread body 123.',
        owner: 'user-456',
        created_at: '2024-05-10T17:14:31.573Z',
        updated_at: '2024-05-10T17:14:31.573Z',
      });

      // Action
      const commentedThread = await threadRepositoryPostgres.getThread('thread-123');

      // Assert
      await expect(commentedThread.rows).toHaveLength(1);
    });
  });

  describe('getReplies function', () => {
    it('should persist get replies', async () => {
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      /** Add thread */
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'New Thread 123',
        body: 'New thread body 123.',
        owner: 'user-456',
        created_at: '2024-05-10T17:14:31.573Z',
        updated_at: '2024-05-10T17:14:31.573Z',
      });

      /** Add comment * */
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        thread: 'thread-123',
        owner: 'user-456',
        is_delete: false,
        created_at: '2024-05-10T17:14:31.573Z',
        updated_at: '2024-05-10T17:14:31.573Z',
      });

      /** Add Reply * */
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Sebuah balasan',
        comment: 'comment-123',
        owner: 'user-456',
        is_delete: false,
        created_at: '2024-05-10T17:14:31.573Z',
        updated_at: '2024-05-10T17:14:31.573Z',
      });

      // Action & Assert
      const replyResult = await threadRepositoryPostgres.getReplies('comment-123');
      await expect(replyResult.rows).toHaveLength(1);
    });
  });
});
