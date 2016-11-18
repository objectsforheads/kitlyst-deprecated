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

Template.userAccount.events({
  'click .deleteDraft': function(e) {
    e.preventDefault();

    Meteor.call('deleteDraft', {hash: this.hash, owner: Meteor.userId()}, function(err, res) {
      if (err) {
        sAlert.error(err.reason);
      } else {
        if (res) {
          sAlert.success(res);
        } else {
          sAlert.error('Server error - try again later');
        }
      }
    })
  }
})
