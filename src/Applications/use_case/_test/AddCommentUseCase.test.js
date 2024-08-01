const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  it('should throw error when thread not available', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New comment',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(async () => { throw new NotFoundError('thread tidak ditemukan'); });

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
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
    const threadId = 'thread-123';
    const ownerId = 'user-123';
    const mockAddedComment = {
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [mockAddedComment],
      }));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload, threadId, ownerId);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));
    expect(mockThreadRepository.verifyThread)
      .toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment)
      .toBeCalledWith(new AddComment({
        content: useCasePayload.content,
      }), threadId, ownerId);
  });
});
