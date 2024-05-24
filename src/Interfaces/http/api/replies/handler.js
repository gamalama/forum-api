const autoBind = require('auto-bind');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postReplyHandler(request, h) {
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(request.payload, threadId, commentId, ownerId);

    return h.response({
      status: 'success',
      data: {
        addedReply,
      },
    }).code(201);
  }

  async deleteReplyHandler(request) {
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute(ownerId, threadId, commentId, replyId);

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
