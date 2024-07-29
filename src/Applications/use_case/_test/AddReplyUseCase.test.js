const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should throw error when thread not available', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New reply',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve({
        rows: [],
      }));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve({
        rows: [{
          id: 'thread-123',
          title: 'Thread title',
          body: 'sebuah thread',
          owner: 'user-123',
          createdAt: '2024-07-28T09:39:02.821Z',
          updatedAt: '2024-07-28T09:39:02.821Z',
        }],
      }));
    mockReplyRepository.verifyComment = jest.fn()
      .mockImplementation(async () => Promise.resolve({ rowCount: 0 }));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{
          id: 'thread-123',
          title: 'Thread title',
          body: 'sebuah thread',
          owner: 'user-123',
          createdAt: '2024-07-28T09:39:02.821Z',
          updatedAt: '2024-07-28T09:39:02.821Z',
        }],
      }));
    mockReplyRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 1 }));
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve({ rows: [mockAddedReply] }));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      'thread-123',
      'comment-123',
      'user-123',
    );

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));

    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      content: useCasePayload.content,
    }), 'comment-123', 'user-123');
  });
});
