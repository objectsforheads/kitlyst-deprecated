import './mainNav.html';

Template.mainNav.events({
  'click .toggleUserAccess': function() {
    Session.set('userAccess', !Session.get('userAccess'));
  }
})
