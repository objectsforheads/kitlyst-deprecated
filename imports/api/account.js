Meteor.publish('userDecks', function() {
  return Decks.find({
    owner: this.userId
  }, {
    fields: {
      name: 1,
      hash: 1,
      view_hash: 1,
      description: 1
    }
  });
})
