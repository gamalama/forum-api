const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
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

  describe('verifyThread function', () => {
    it('should throw error when thread not found', async () => {
      // const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const verifyThread = async () => threadRepositoryPostgres.verifyThread('thread-001');

      // Assert
      await expect(verifyThread).rejects.toThrowError('thread tidak ditemukan');
    });

    it('should not throw error', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

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
      const verifyThread = async () => threadRepositoryPostgres.verifyThread('thread-123');

      // Assert
      await expect(verifyThread).not.toThrowError();
    });
  });
});
