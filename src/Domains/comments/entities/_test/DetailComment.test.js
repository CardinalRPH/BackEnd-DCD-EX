const DetailComment = require('../DetailComment');

describe('a DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
    };

    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      comments: {},
    };

    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should remap comments data correctly', () => {
    const payload = {
      comments: [
        {
          id: 'comment-_pby2_NlDF-t829sYbGYK4dvBKq',
          username: 'Alpha',
          date: '2023-08-25T11:58:00.323Z',
          content: 'some comment',
          is_deleted: 0,
        },
        {
          id: 'comment-_pby2_NlDF-t829sYbGYK4dvBKn',
          username: 'foxtrot',
          date: '2023-08-26T11:58:00.323Z',
          content: 'deleted comment',
          is_deleted: 1,
        },
      ],
    };

    const { comments } = new DetailComment(payload);

    const expectedComment = [
      {
        id: 'comment-_pby2_NlDF-t829sYbGYK4dvBKq',
        username: 'Alpha',
        date: '2023-08-25T11:58:00.323Z',
        content: 'some comment',
      },
      {
        id: 'comment-_pby2_NlDF-t829sYbGYK4dvBKn',
        username: 'foxtrot',
        date: '2023-08-26T11:58:00.323Z',
        content: '**komentar telah dihapus**',
      },
    ];

    expect(comments).toEqual(expectedComment);
  });

  it('should create DetailComment object correctly', () => {
    const payload = {
      comments: [
        {
          id: 'comment-_pby2_NlDF-t829sYbGYK4dvBKq',
          username: 'Alpha',
          date: '2023-08-25T11:58:00.323Z',
          content: 'some comment',
        },
        {
          id: 'comment-_pby2_NlDF-t829sYbGYK4dvBKn',
          username: 'foxtrot',
          date: '2023-08-26T11:58:00.323Z',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    const { comments } = new DetailComment(payload);

    expect(comments).toEqual(payload.comments);
  });
});
