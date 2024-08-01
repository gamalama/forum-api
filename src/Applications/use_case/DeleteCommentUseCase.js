const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, threadId, commentId) {
    await this._threadRepository.verifyThread(threadId);

    const verifyCommentOwner = await this._commentRepository.verifyCommentOwner(ownerId, commentId);

    if (verifyCommentOwner.rows.length === 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    if (verifyCommentOwner.rows[0].owner !== ownerId) {
      throw new AuthorizationError('tidak berhak menghapus komentar');
    }

    this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
