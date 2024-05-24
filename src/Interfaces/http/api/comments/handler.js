const autoBind = require('auto-bind');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postCommentHandler(request, h) {
    const { id: ownerId } = request.auth.credentials;
    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(request.payload, threadId, ownerId);

    return h.response({
      status: 'success',
      data: {
        addedComment,
      },
    }).code(201);
  }

  async deleteCommentHandler(request, h) {
    const { id: ownerId } = request.auth.credentials;
    const { threadId } = request.params;
    const { commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute(ownerId, threadId, commentId);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
