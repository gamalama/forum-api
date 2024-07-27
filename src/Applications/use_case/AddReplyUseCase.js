const AddReply = require('../../Domains/replies/entities/AddReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, commentId, ownerId) {
    const addReply = new AddReply(useCasePayload);
    const verifyThread = await this._commentRepository.verifyThread(threadId);

    if (verifyThread.rows.length === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const verifyComment = await this._replyRepository.verifyComment(commentId);

    if (!verifyComment.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    const addedReply = await this._replyRepository.addReply(addReply, commentId, ownerId);
    return new AddedReply({ ...addedReply.rows[0] });
  }
}

module.exports = AddReplyUseCase;
