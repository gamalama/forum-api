/* istanbul ignore file */
/* eslint-disable camelcase */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-456',
    content = 'New Comment from user-456',
    thread = 'thread-123',
    owner = 'user-456',
    is_delete = false,
    created_at = '2024-05-10T17:15:31.573Z',
    updated_at = '2024-05-10T17:15:31.573Z',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, content, thread, owner, is_delete, created_at, updated_at],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 and is_delete = FALSE',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentDeletedById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 and is_delete = TRUE',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
