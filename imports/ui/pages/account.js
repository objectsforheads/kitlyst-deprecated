import './account.html';

Template.userAccount.onCreated(function() {
  var self = this;
  self.subscribe('userDecks');
})

Template.userAccount.helpers({
  'userDecks': function() {
    return Decks.find();
  }
})
