const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {}); // Dummy dependency

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepositoryPostgres);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addComment function', () => {
      it('should persist new comment and return added comment correctly', async () => {
        await UsersTableTestHelper.addUser({ id: 'user-1234567', username: 'Alpha' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_123', body: 'some thread content', owner: 'user-1234567' });

        const newComment = new AddComment({
          content: 'some comment',
          thread: 'thread-h_123',
          owner: 'user-1234567',
        });

        const fakeIdGenerator = () => '123456789abcdef';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        const addedComment = await commentRepositoryPostgres.addComment(newComment);

        const comment = await CommentsTableTestHelper.findCommentsById('comment-_pby2_123456789abcdef');
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-_pby2_123456789abcdef',
          content: 'some comment',
          owner: 'user-1234567',
        }));
        expect(comment).toHaveLength(1);
      });
    });

    describe('checkAvailabilityComment function', () => {
      it('should throw NotFoundError if comment not available', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const comment = 'some comment';

        // Action & Assert
        await expect(commentRepositoryPostgres.checkAvailabilityComment(comment))
          .rejects.toThrow(NotFoundError);
      });

      it('should not throw NotFoundError if comment available', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-12345679', username: 'Alpha' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_123456', body: 'some thread content', owner: 'user-12345679' });
        await CommentsTableTestHelper.addComment({
          id: 'comment-_pby2-123456', content: 'some comment', thread: 'thread-h_123456', owner: 'user-12345679',
        });

        // Action & Assert
        await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-_pby2-123456'))
          .resolves.not.toThrow(NotFoundError);
      });
    });

    describe('verifyCommentOwner function', () => {
      it('should throw AuthorizationError if comment not belong to owner', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-1234569', username: 'Alpha' });
        await UsersTableTestHelper.addUser({ id: 'user-1234599', username: 'Foxtrot' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_1234567', body: 'some thread content', owner: 'user-1234569' });
        await CommentsTableTestHelper.addComment({
          id: 'comment-_pby2-1234567', content: 'some comment', thread: 'thread-h_1234567', owner: 'user-1234569',
        });
        const comment = 'comment-_pby2-1234567';
        const owner = 'user-123459';

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentOwner(comment, owner))
          .rejects.toThrow(AuthorizationError);
      });

      it('should not throw AuthorizationError if comment is belongs to owner', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'Alpha' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_12345678', body: 'some thread content', owner: 'user-12345' });
        await CommentsTableTestHelper.addComment({
          id: 'comment-_pby2-123456789', content: 'some comment', thread: 'thread-h_12345678', owner: 'user-12345',
        });

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentOwner('comment-_pby2-123456789', 'user-12345'))
          .resolves.not.toThrow(AuthorizationError);
      });
    });

    describe('deleteComment', () => {
      it('should delete comment from database', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-1239', username: 'Alpha' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_123456789', body: 'some thread content', owner: 'user-1239' });
        await CommentsTableTestHelper.addComment({
          id: 'comment-_pby2-1234567810', content: 'some comment', thread: 'thread-h_123456789', owner: 'user-1239',
        });

        // Action
        await commentRepositoryPostgres.deleteComment('comment-_pby2-1234567810');

        // Assert
        const comment = await CommentsTableTestHelper.checkIsDeletedCommentsById('comment-_pby2-1234567810');
        expect(comment).toEqual(true);
      });
    });

    describe('getCommentsThread', () => {
      it('should get comments of thread', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const userPayload = { id: 'user-12345678910', username: 'Alpha' };
        const threadPayload = {
          id: 'thread-h_12345678X1',
          title: 'some thread title',
          body: 'some thread content',
          owner: 'user-12345678910',
        };
        const commentPayload = {
          id: 'comment-_pby2-1234567811',
          content: 'some comment',
          thread: threadPayload.id,
          owner: userPayload.id,
        };

        await UsersTableTestHelper.addUser(userPayload);
        await ThreadsTableTestHelper.addThread(threadPayload);
        await CommentsTableTestHelper.addComment(commentPayload);

        const comments = await commentRepositoryPostgres.getCommentsThread(threadPayload.id);

        expect(Array.isArray(comments)).toBe(true);
        expect(comments[0].id).toEqual(commentPayload.id);
        expect(comments[0].username).toEqual(userPayload.username);
        expect(comments[0].content).toEqual('some comment');
        expect(comments[0].date).toBeDefined();
      });
    });
  });
});
