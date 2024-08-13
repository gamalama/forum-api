const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
  it('should throw error invoke abstract behaviour', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Action and Assert
    await expect(likeRepository.verifyLikeIsExist({}))
      .rejects
      .toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.addLike({}))
      .rejects
      .toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.deleteLike({}))
      .rejects
      .toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.countLike())
      .rejects
      .toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
