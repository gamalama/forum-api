const AddReply = require('../../Domains/replies/entities/AddReply');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, threadId, commentId, ownerId) {
    const addReply = new AddReply(useCasePayload);
    await this._threadRepository.verifyThread(threadId);
    await this._commentRepository.verifyCommentIsExist(commentId);

    const addedReply = await this._replyRepository.addReply(addReply, commentId, ownerId);
    return new AddedReply({ ...addedReply[0] });
  }
}

module.exports = AddReplyUseCase;
