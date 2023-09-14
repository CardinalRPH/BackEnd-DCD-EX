const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'some thread title',
      owner: 'user-123',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: true,
      owner: true,
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new thread object correctly', () => {
    const payload = {
      title: 'some thread title',
      body: 'some thread content',
      owner: 'user-123',
    };

    const { title, body, owner } = new AddThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
