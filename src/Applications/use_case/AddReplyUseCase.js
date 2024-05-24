const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, commentId, ownerId) {
    const addReply = new AddReply(useCasePayload);
    await this._commentRepository.verifyThread(threadId);
    await this._replyRepository.verifyComment(commentId);
    return this._replyRepository.addReply(addReply, commentId, ownerId);
  }
}

module.exports = AddReplyUseCase;
