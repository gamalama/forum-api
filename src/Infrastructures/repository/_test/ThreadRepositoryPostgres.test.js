const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

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

    it('should return thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'New Thread',
        body: 'New thread body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread, 'user-456');

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'New Thread',
        owner: 'user-456',
      }));
    });
  });

  describe('getThread function', () => {
    it('should persist get thread', async () => {
      // Arrange
      /** Add thread */
      const addThread = new AddThread({
        title: 'New Thread',
        body: 'New thread body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      //  id = 'comment-456',
      //     content = 'New Comment from user-456',
      //     thread = 'thread-123',
      //     owner = 'user-456',
      //     is_delete = false,
      //     created_at = '2024-05-10T17:15:31.573Z',
      //     updated_at = '2024-05-10T17:15:31.573Z',

      // Action
      await threadRepositoryPostgres.addThread(addThread, 'user-456');

      /** Add comments */
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        thread: 'thread-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-789',
        content: 'komentar akan dihapus',
        thread: 'thread-123',
        is_delete: true,
      });

      // Assert
      await expect(threadRepositoryPostgres.getThread('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});
