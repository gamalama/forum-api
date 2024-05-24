const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New comment',
    };
    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload, 'thread-123', 'user-123');

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));

    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      content: useCasePayload.content,
    }), 'thread-123', 'user-123');
  });
});
