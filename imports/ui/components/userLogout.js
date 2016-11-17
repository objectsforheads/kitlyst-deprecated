import './userLogout.html';

Template.userLogout.events({
  'click .user-logout'(e) {
    e.preventDefault();
    Meteor.logout();
  }
})
