const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('AddReplyUseCase', () => {
  it('should throw error when thread not available', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New reply',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(async () => { throw new NotFoundError('thread tidak ditemukan'); });

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload, 'thread-123', 'comment-123', 'user-123'))
      .rejects.toThrowError('thread tidak ditemukan');
  });

  it('should throw error when comment not available', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New reply',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    // const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(async () => { throw new NotFoundError('komentar tidak ditemukan'); });

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload, 'thread-123', 'comment-123', 'user-123'))
      .rejects.toThrowError('komentar tidak ditemukan');
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New reply',
    };
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const ownerId = 'user-123';
    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve({ rows: [mockAddedReply] }));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      threadId,
      commentId,
      ownerId,
    );

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));
    expect(mockThreadRepository.verifyThread)
      .toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment(commentId));
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      content: useCasePayload.content,
    }), 'comment-123', 'user-123');
  });
});
