import './userLogout.html';

Template.userLogout.events({
  'click .user-logout'() {
    Meteor.logout();
  }
})
