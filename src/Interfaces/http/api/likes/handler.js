const autoBind = require('auto-bind');
const ToggleLikeUseCase = require('../../../../Applications/use_case/ToggleLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async toggleLikeHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const toggleLikeUseCase = this._container
      .getInstance(ToggleLikeUseCase.name);
    await toggleLikeUseCase.execute(userId, threadId, commentId);

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
