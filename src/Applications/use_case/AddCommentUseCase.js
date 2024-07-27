const AddComment = require('../../Domains/comments/entities/AddComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, ownerId) {
    const addComment = new AddComment(useCasePayload);
    // await this._commentRepository.verifyThread(threadId);
    const verifyThread = await this._commentRepository.verifyThread(threadId);
    if (verifyThread.rows.length === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    return this._commentRepository.addComment(addComment, threadId, ownerId);
  }
}

module.exports = AddCommentUseCase;
