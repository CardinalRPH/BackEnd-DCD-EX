const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'jwt_auth',
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getDetailThreadHandler,
  },
]);

module.exports = routes;
