const KARMA_ADD_STATUS = Object.freeze({
  SUCCESS_UP: 'points-added-karma-increased',
  SUCCESS_DOWN: 'points-added-karma-decreased',
  SUCCESS_INITIAL: 'points-added-default-karma-included',
  FAILURE_SELF_KARMA: 'failed-points-added-to-self',
  FAILURE: 'failed-to-add-points',
});

const KARMA_GET_STATUS = Object.freeze({
  SUCCESSFUL: 'karma-retrieved',
  USER_NOT_FOUND: 'user-name-found',
});

module.exports = {
  KARMA_ADD_STATUS,
  KARMA_GET_STATUS,
};
