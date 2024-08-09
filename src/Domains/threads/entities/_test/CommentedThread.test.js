const CommentedThread = require('../CommentedThread');

describe('an CommentedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Commented Thread',
      body: 'A body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-_pby2_tmXV6bcvcdev8xk',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-yksuCoxM2s4MMrZJO-qVD',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    // Action and Assert
    expect(() => new CommentedThread(payload)).toThrowError('COMMENTED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'Commented Thread',
      body: 'A body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-_pby2_tmXV6bcvcdev8xk',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-yksuCoxM2s4MMrZJO-qVD',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    // Action and Assert
    expect(() => new CommentedThread(payload)).toThrowError('COMMENTED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create commentedThread object correctly', () => {
    // Arrange
    const payload = {
      id: '123',
      title: 'Commented Thread',
      body: 'A body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-_pby2_tmXV6bcvcdev8xk',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-yksuCoxM2s4MMrZJO-qVD',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    // Action
    const commentedThread = new CommentedThread(payload);

    // Assert
    expect(commentedThread.id).toEqual(payload.id);
    expect(commentedThread.title).toEqual(payload.title);
    expect(commentedThread.body).toEqual(payload.body);
    expect(commentedThread.date).toEqual(payload.date);
    expect(commentedThread.username).toEqual(payload.username);
    expect(commentedThread.comments).toEqual(payload.comments);
  });
});
