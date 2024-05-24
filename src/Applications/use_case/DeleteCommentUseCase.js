class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(ownerId, threadId, commentId) {
    await this._commentRepository.verifyThread(threadId);
    await this._commentRepository.verifyCommentOwner(ownerId, commentId);
    return this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
