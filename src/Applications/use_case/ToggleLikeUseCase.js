class ToggleLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(userId, threadId, commentId) {
    await this._threadRepository.verifyThreadIsExist(threadId);

    await this._commentRepository.verifyCommentIsExist(commentId);

    const rowCount = await this._likeRepository.verifyLikeIsExist(commentId, userId);

    if (rowCount === 1) {
      await this._likeRepository.deleteLike(commentId, userId);
    } else {
      await this._likeRepository.addLike(commentId, userId);
    }
  }
}

module.exports = ToggleLikeUseCase;
