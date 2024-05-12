const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, ownerId) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread, ownerId);
  }
}

module.exports = AddThreadUseCase;
