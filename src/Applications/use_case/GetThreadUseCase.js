const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentedThread = require('../../Domains/threads/entities/CommentedThread');

class GetThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const getThread = await this._threadRepository.getThread(threadId);

    if (getThread.length === 0) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const getComments = await this._commentRepository.getComments(threadId);

    const getReplies = async (commentId) => {
      const replies = await this._replyRepository.getReplies(commentId);
      return replies.map((reply) => ({
        id: reply.id,
        content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
        date: reply.updated_at,
        username: reply.username,
      }));
    };

    const commentLikes = async (commentId) => {
      const count = await this._likeRepository.countLike(commentId);
      return Number(count);
    };

    const comments = await Promise.all(getComments.map(async (comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.updated_at,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      replies: await getReplies(comment.id),
      likeCount: await commentLikes(comment.id),
    })));

    return new CommentedThread({
      id: getThread[0].id,
      title: getThread[0].title,
      body: getThread[0].body,
      date: getThread[0].created_at,
      username: getThread[0].username,
      comments,
    });
  }
}

module.exports = GetThreadUseCase;
