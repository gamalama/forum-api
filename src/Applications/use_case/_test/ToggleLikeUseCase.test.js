const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ToggleLikeUseCase = require('../ToggleLikeUseCase');

describe('ToggleUserCommentLikesUseCase', () => {
  it('should orchestrating the delete user comment like action correctly', async () => {
    const ownerId = 'owner-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    // Arrange
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve(1));
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeUseCase = new ToggleLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeUseCase.execute(ownerId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadIsExist)
      .toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentIsExist)
      .toBeCalledWith(commentId);
    expect(mockLikeRepository.verifyLikeIsExist)
      .toBeCalledWith(commentId, ownerId);
    expect(mockLikeRepository.deleteLike)
      .toBeCalledWith(commentId, ownerId);
    expect(mockLikeRepository.addLike)
      .not
      .toBeCalled();
  });

  it('should orchestrating the add user comment like action correctly', async () => {
    const ownerId = 'owner-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    // Arrange
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve('0'));
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => {});
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeUseCase = new ToggleLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeUseCase.execute(ownerId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadIsExist)
      .toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentIsExist)
      .toBeCalledWith(commentId);
    expect(mockLikeRepository.verifyLikeIsExist)
      .toBeCalledWith(commentId, ownerId);
    expect(mockLikeRepository.deleteLike)
      .not
      .toBeCalled();
    expect(mockLikeRepository.addLike)
      .toBeCalledWith(commentId, ownerId);
  });
});
