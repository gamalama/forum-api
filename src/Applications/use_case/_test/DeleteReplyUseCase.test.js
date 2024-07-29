const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw error when thread not found', async () => {
    // Arrange
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [],
      }));
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 1 }));

    /** creating use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(
      'user-123',
      'thread-123',
      'comment-123',
      'reply-123',
    )).rejects.toThrowError('thread tidak ditemukan');
  });

  it('should throw error when comment not found', async () => {
    // Arrange
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{}],
      }));
    mockReplyRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 0 }));

    /** creating use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(
      'user-123',
      'thread-123',
      'comment-123',
      'reply-123',
    )).rejects.toThrowError('komentar tidak ditemukan');
  });

  it('should throw error when reply not found', async () => {
    // Arrange
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{}],
      }));
    mockReplyRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 1 }));
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 0 }));

    /** creating use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(
      'user-123',
      'thread-123',
      'comment-123',
      'reply-123',
    )).rejects.toThrowError('balasan tidak ditemukan');
  });

  it('should throw error when user have no righ', async () => {
    // Arrange
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{}],
      }));
    mockReplyRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 1 }));
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 1, rows: [{ owner: 'user-456' }] }));

    /** creating use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(
      'user-123',
      'thread-123',
      'comment-123',
      'reply-123',
    )).rejects.toThrowError('tidak berhak menghapus balasan');
  });

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
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
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rowCount: 1,
        rows: [{
          id: 'thread-123',
          title: 'Thread title',
          body: 'sebuah thread',
          owner: 'user-123',
          createdAt: '2024-07-28T09:39:02.821Z',
          updatedAt: '2024-07-28T09:39:02.821Z',
        }],
      }));
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 1 }));

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
