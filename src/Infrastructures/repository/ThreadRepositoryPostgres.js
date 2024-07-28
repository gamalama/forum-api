const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread, owner) {
    const id = `thread-${this._idGenerator()}`;
    const { title, body } = addThread;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
      values: [id, title, body, owner, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThread(threadId) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.created_at, u.username
            FROM threads as t
            INNER JOIN users as u ON t.owner = u.id
            WHERE t.id = $1`,
      values: [threadId],
    };

    return this._pool.query(query);
  }

  async getComments(threadId) {
    const query = {
      text: `SELECT c.id, c.owner, c.updated_at, c.content, c.is_delete, u.username 
            FROM comments as c
            INNER JOIN users as u ON c.owner = u.id
            WHERE thread = $1`,
      values: [threadId],
    };

    return this._pool.query(query);
  }

  async getReplies(commentId) {
    const query = {
      text: `SELECT r.id, r.content, r.updated_at, r.owner, r.is_delete, u.username
            FROM replies as r
            INNER JOIN users as u ON r.owner = u.id
            WHERE comment = $1`,
      values: [commentId],
    };

    return this._pool.query(query);
  }
}

module.exports = ThreadRepositoryPostgres;
