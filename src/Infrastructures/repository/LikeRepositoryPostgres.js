const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyLikeIsExist(commentId, userId) {
    const query = {
      text: 'SELECT 1 FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount;
  }

  async addLike(commentId, userId) {
    const id = `${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO user_comment_likes(id, user_id, comment_id) VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    this._pool.query(query);
  }

  async deleteLike(commentId, userId) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async countLike(commentId) {
    const query = {
      text: `SELECT COUNT(comment_id) FROM user_comment_likes
            WHERE comment_id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].count;
  }
}

module.exports = LikeRepositoryPostgres;
