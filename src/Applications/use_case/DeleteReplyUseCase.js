class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(ownerId, threadId, commentId, replyId) {
    await this._threadRepository.verifyThreadIsExist(threadId);

    await this._commentRepository.verifyCommentIsExist(commentId);

    await this._replyRepository.verifyReplyIsExist(replyId);

    await this._replyRepository.verifyReplyOwner(ownerId, replyId);

    this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
