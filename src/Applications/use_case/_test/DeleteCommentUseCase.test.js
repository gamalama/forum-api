const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error when thread not available', async () => {
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve({
        rows: [],
      }));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute('user-123', 'thread-123', 'comment-123'))
      .rejects.toThrowError('thread tidak ditemukan');
  });

  it('should throw error when comment not available', async () => {
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve({
        rows: [{
          id: 'comment-123',
          title: 'Thread title',
          body: 'sebuah thread',
          owner: 'user-123',
          createdAt: '2024-07-28T09:39:02.821Z',
          updatedAt: '2024-07-28T09:39:02.821Z',
        }],
      }));
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(async () => Promise.resolve({ rows: [] }));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute('user-123', 'thread-123', 'comment-123'))
      .rejects.toThrowError('komentar tidak ditemukan');
  });

  it('should throw error when user have no rights', async () => {
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(async () => Promise.resolve({
        rows: [{
          id: 'comment-123',
          title: 'Thread title',
          body: 'sebuah thread',
          owner: 'user-123',
          createdAt: '2024-07-28T09:39:02.821Z',
          updatedAt: '2024-07-28T09:39:02.821Z',
        }],
      }));
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(async () => Promise.resolve({
        rows: [{
          owner: 'user-456',
        }],
      }));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute('user-123', 'thread-123', 'comment-123'))
      .rejects.toThrowError('tidak berhak menghapus komentar');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{
          id: 'comment-123',
          title: 'Thread title',
          body: 'sebuah thread',
          owner: 'user-123',
          createdAt: '2024-07-28T09:39:02.821Z',
          updatedAt: '2024-07-28T09:39:02.821Z',
        }],
      }));
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{
          id: 'comment-123',
          content: 'sebuah komentar',
          thread: 'thread-123',
          owner: 'user-123',
          is_delete: false,
          created_at: '2024-07-28T09:39:02.821Z',
          updated_at: '2024-07-28T09:39:02.821Z',
        }],
      }));
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve({ rowCount: 1 }));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute('user-123', 'thread-123', 'comment-123');

    expect(mockCommentRepository.deleteComment).toBeCalledWith('comment-123');
  });
});
