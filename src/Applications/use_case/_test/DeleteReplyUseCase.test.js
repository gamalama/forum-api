const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteReplyUseCase.execute(
      'user-123',
      'thread-123',
      'comment-123',
      'reply-123',
    );

    // Assert
    expect(mockCommentRepository.verifyThread)
      .toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.verifyComment)
      .toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith('user-123', 'reply-123');
    expect(mockReplyRepository.deleteReply)
      .toHaveBeenCalledWith('reply-123');
  });
});
