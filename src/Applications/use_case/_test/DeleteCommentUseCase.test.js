const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute('user-123', 'thread-123', 'comment-123');

    expect(mockCommentRepository.deleteComment).toBeCalledWith('comment-123');
  });
});
