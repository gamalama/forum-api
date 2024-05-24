/* istanbul ignore file */
/* eslint-disable camelcase */

const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'replies-123',
    content = 'New reply 123',
    comment = 'Comment 123',
    owner = 'user-123',
    is_delete = false,
    created_at = '2024-05-10T17:14:31.573Z',
    updated_at = '2024-05-10T17:14:31.573Z',
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, content, comment, owner, is_delete, created_at, updated_at],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
