const UserCommentLikeRepository = require('../UserCommentLikeRepository');

describe('UserCommentLikeRepository interface', () => {
  it('should throw error invoke abstract behaviour', async () => {
    // Arrange
    const userCommentLikeRepository = new UserCommentLikeRepository();

    // Action and Assert
    await expect(userCommentLikeRepository.verifyUserCommentLikeIsExist({}))
      .rejects
      .toThrowError('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userCommentLikeRepository.addUserCommentLike({}))
      .rejects
      .toThrowError('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userCommentLikeRepository.deleteUserCommentLike({}))
      .rejects
      .toThrowError('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
