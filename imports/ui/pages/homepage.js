import './homepage.html';
import '../components/userSignup.js';
import '../components/userLogin.js';
import '../components/userLogout.js'

Template.homepage.events({
  'click .toggleAccountAccess': function() {
    $('.user-signup-container').toggle();
    $('.user-login-container').toggle().removeClass('hidden');
  },
  'click .newDeck': function(e) {
    e.preventDefault();
    Meteor.call('newDeckDraft', null, function(error, data) {
      if (error) {
        Bert.alert(error.reason, 'danger');
      }
      else {
        FlowRouter.go('/deck/build/' + data);
      }
    });
  }
});
