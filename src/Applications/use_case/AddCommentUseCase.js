const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, ownerId) {
    const addComment = new AddComment(useCasePayload);
    await this._commentRepository.verifyThread(threadId);
    return this._commentRepository.addComment(addComment, threadId, ownerId);
  }
}

module.exports = AddCommentUseCase;
