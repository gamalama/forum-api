const CommentedThread = require('../../../Domains/threads/entities/CommentedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const CommentRepository = require(
  '../../../Domains/comments/CommentRepository',
);
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadUseCase', () => {
  it('should throw error when thread not found', async () => {
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rowCount: 0,
      }));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({ threadRepository: mockThreadRepository });

    // Action & Assert
    await expect(getThreadUseCase.execute('thread-h_2FkLZhtgBKY2kh4CC02'))
      .rejects.toThrowError('Thread tidak ditemukan');
  });

  it('should orchestrating the get thread action correctly', async () => {
    const mockCommentedThread = {
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      created_at: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rowCount: 1, rows: [mockCommentedThread],
      }));
    mockCommentRepository.getComments = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{
          id: 'comment-_pby2_tmXV6bcvcdev8xk',
          username: 'johndoe',
          updated_at: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        }],
      }));
    mockReplyRepository.getReplies = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{
          id: 'reply-xNBtm9HPR-492AeiimpfN',
          content: 'sebuah balasan',
          updated_at: '2021-08-08T08:07:01.522Z',
          username: 'dicoding',
        }],
      }));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const commentedThread = await getThreadUseCase.execute('thread-h_2FkLZhtgBKY2kh4CC02');

    // Assert
    expect(commentedThread).toStrictEqual(new CommentedThread(
      {
        id: 'thread-h_2FkLZhtgBKY2kh4CC02',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
        comments: [
          {
            id: 'comment-_pby2_tmXV6bcvcdev8xk',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            content: 'sebuah comment',
            replies: [{
              id: 'reply-xNBtm9HPR-492AeiimpfN',
              content: 'sebuah balasan',
              date: '2021-08-08T08:07:01.522Z',
              username: 'dicoding',
            }],
          },
        ],
      },
    ));
  });

  it('should orchestrating the get thread action correctly with comment and reply deleted', async () => {
    const threadId = 'thread-h_2FkLZhtgBKY2kh4CC02';
    const commentId = 'comment-_pby2_tmXV6bcvcdev8xk';
    const mockCommentedThread = {
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      created_at: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rowCount: 1, rows: [mockCommentedThread],
      }));
    mockCommentRepository.getComments = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{
          id: commentId,
          username: 'johndoe',
          updated_at: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          is_delete: true,
        }],
      }));
    mockReplyRepository.getReplies = jest.fn()
      .mockImplementation(() => Promise.resolve({
        rows: [{
          id: 'reply-xNBtm9HPR-492AeiimpfN',
          content: 'sebuah balasan',
          updated_at: '2021-08-08T08:07:01.522Z',
          username: 'dicoding',
          is_delete: true,
        }],
      }));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const commentedThread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(commentedThread).toStrictEqual(new CommentedThread(
      {
        id: 'thread-h_2FkLZhtgBKY2kh4CC02',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
        comments: [
          {
            id: 'comment-_pby2_tmXV6bcvcdev8xk',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            content: '**komentar telah dihapus**',
            replies: [{
              id: 'reply-xNBtm9HPR-492AeiimpfN',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T08:07:01.522Z',
              username: 'dicoding',
            }],
          },
        ],
      },
    ));
    expect(mockThreadRepository.getThread)
      .toBeCalledWith(threadId);
    expect(mockCommentRepository.getComments)
      .toBeCalledWith(threadId);
    expect(mockReplyRepository.getReplies)
      .toBeCalledWith(commentId);
  });
});
