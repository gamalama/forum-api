const AddReply = require('../../Domains/replies/entities/AddReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

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

    await this._replyRepository.verifyComment(commentId);
    return this._replyRepository.addReply(addReply, commentId, ownerId);
  }
}

module.exports = AddReplyUseCase;
