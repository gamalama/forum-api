class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(ownerId, threadId, commentId) {
    await this._threadRepository.verifyThread(threadId);

    await this._commentRepository.verifyCommentOwner(ownerId, commentId);

    this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
