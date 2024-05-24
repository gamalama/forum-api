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
    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      /** Add thread */
      const addThread = new AddThread({
        title: 'New Thread',
        body: 'New thread body',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread, 'user-456');

      // Action & Assert
      await expect(threadRepositoryPostgres.getThread('thread-456'))
        .rejects.toThrowError(NotFoundError);
    });

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
      await expect(commentedThread)
        // .resolves.not.toThrow(NotFoundError);
        .toStrictEqual(new CommentedThread({
          id: 'thread-123',
          title: 'New Thread 123',
          body: 'New thread body 123.',
          date: '2024-05-10T17:14:31.573Z',
          username: 'dicoding',
          comments: [],
        }));
    });
  });
});
