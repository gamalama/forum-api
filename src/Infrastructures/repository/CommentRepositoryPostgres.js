const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyThread(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async verifyCommentOwner(ownerId, commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };
    return this._pool.query(query);
  }

  async addComment(addComment, threadId, owner) {
    const id = `comment-${this._idGenerator()}`;
    const { content } = addComment;
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO comments(id, content, thread, owner, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner`,
      values: [id, content, threadId, owner, createdAt, createdAt],
    };

    return this._pool.query(query);
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [commentId],
    };
    return this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
