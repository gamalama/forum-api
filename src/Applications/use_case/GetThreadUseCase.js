const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentedThread = require('../../Domains/threads/entities/CommentedThread');

class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    const getThread = await this._threadRepository.getThread(threadId);

    if (!getThread.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const getComments = await this._threadRepository.getComments(threadId);

    const getReplies = async (commentId) => {
      const replies = await this._threadRepository.getReplies(commentId);
      return replies.rows.map((reply) => ({
        id: reply.id,
        content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
        date: reply.updated_at,
        username: reply.username,
      }));
    };

    const comments = await Promise.all(getComments.rows.map(async (comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.updated_at,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      replies: await getReplies(comment.id),
    })));

    return new CommentedThread({
      id: getThread.rows[0].id,
      title: getThread.rows[0].title,
      body: getThread.rows[0].body,
      date: getThread.rows[0].created_at,
      username: getThread.rows[0].username,
      comments,
    });
  }
}

module.exports = GetThreadUseCase;
