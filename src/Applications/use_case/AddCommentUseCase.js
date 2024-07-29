const AddComment = require('../../Domains/comments/entities/AddComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, ownerId) {
    const addComment = new AddComment(useCasePayload);

    const verifyThread = await this._commentRepository.verifyThread(threadId);
    if (verifyThread.rows.length === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const addedComment = await this._commentRepository.addComment(addComment, threadId, ownerId);

    return new AddedComment({ ...addedComment.rows[0] });
  }
}

module.exports = AddCommentUseCase;
