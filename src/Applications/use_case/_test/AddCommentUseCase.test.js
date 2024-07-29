const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should throw error when thread not available', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New comment',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve({
        rows: [],
      }));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(addCommentUseCase.execute(useCasePayload, 'thread-123', 'user-123'))
      .rejects.toThrowError('thread tidak ditemukan');
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New comment',
    };
    const mockAddedComment = {
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve({
        rows: [{
          id: 'comment-123',
          title: 'Thread title',
          body: useCasePayload.content,
          owner: 'user-123',
          createdAt: '2024-07-28T09:39:02.821Z',
          updatedAt: '2024-07-28T09:39:02.821Z',
        }],
      }));

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [mockAddedComment],
      }));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload, 'thread-123', 'user-123');

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));

    expect(mockCommentRepository.verifyThread).not.toThrowError();

    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      content: useCasePayload.content,
    }), 'thread-123', 'user-123');
  });
});
