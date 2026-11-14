migrate(app => {
  const users = app.findCollectionByNameOrId('users');
  // Domain, required fields, ID pattern and password length stay schema-enforced.
  users.createRule = ['verified', 'emailVisibility', 'tokenKey', 'id'].map(
    f => '@request.body.' + f + ':isset = false').join(' && ');
  // Preserve the existing authRule: no new email-verification policy is invented.
  app.save(users);
}, app => {
  const users = app.findCollectionByNameOrId('users');
  users.createRule = null;
  app.save(users);
});
