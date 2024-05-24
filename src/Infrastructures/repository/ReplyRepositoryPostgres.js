const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyComment(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async addReply(addReply, commentId, owner) {
    const id = `reply-${this._idGenerator()}`;
    const { content } = addReply;
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO replies(id, content, comment, owner, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner`,
      values: [id, content, commentId, owner, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyOwner(ownerId, replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== ownerId) {
      throw new AuthorizationError('tidak berhak menghapus balasan');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
