const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentedThread = require('../../Domains/threads/entities/CommentedThread');

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

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const comments = await this._getComments(threadId);

    const commentedThread = new CommentedThread({
      id: result.rows[0].id,
      title: result.rows[0].title,
      body: result.rows[0].body,
      date: result.rows[0].created_at,
      username: result.rows[0].username,
      comments,
    });

    return commentedThread;
  }

  async _getComments(threadId) {
    const query = {
      text: `SELECT c.id, c.owner, c.updated_at, c.content, c.is_delete, u.username 
            FROM comments as c
            INNER JOIN users as u ON c.owner = u.id
            WHERE thread = $1`,
      values: [threadId],
    };

    const comments = await this._pool.query(query);

    return Promise.all(comments.rows.map(async (comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.updated_at,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      replies: await this._getReplies(comment.id),
    })));
  }

  async _getReplies(commentId) {
    const query = {
      text: `SELECT r.id, r.content, r.updated_at, r.owner, r.is_delete, u.username
            FROM replies as r
            INNER JOIN users as u ON r.owner = u.id
            WHERE comment = $1`,
      values: [commentId],
    };

    const replies = await this._pool.query(query);

    return replies.rows.map((reply) => ({
      id: reply.id,
      content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
      date: reply.updated_at,
      username: reply.username,
    }));
  }
}

module.exports = ThreadRepositoryPostgres;
