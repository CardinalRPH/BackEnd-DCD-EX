const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this.threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new AddThread(useCasePayload);
    return this.threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;
