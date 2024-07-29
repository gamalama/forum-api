const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(ownerId, threadId, commentId, replyId) {
    const verifyThread = await this._commentRepository.verifyThread(threadId);

    if (verifyThread.rows.length === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const verifyComment = await this._replyRepository.verifyComment(commentId);

    if (!verifyComment.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    const verifyReplyOwner = await this._replyRepository.verifyReplyOwner(ownerId, replyId);
    if (!verifyReplyOwner.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (verifyReplyOwner.rows[0].owner !== ownerId) {
      throw new AuthorizationError('tidak berhak menghapus balasan');
    }

    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
