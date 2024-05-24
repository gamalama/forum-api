class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(ownerId, threadId, commentId, replyId) {
    await this._commentRepository.verifyThread(threadId);
    await this._replyRepository.verifyComment(commentId);
    await this._replyRepository.verifyReplyOwner(ownerId, replyId);
    return this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
