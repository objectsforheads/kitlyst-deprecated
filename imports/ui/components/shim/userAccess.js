import './userAccess.html';

import '../userSignup.js';
import '../userLogin.js';
import '../userLogout.js'

Template.userAccessShim.events({
  'click .toggleAccountAccess': function() {
    $('.user-signup-container').toggle();
    $('.user-login-container').toggle().removeClass('hidden');
  },
  'click .userAccessToggle': function() {
    Session.set('userAccess', false);
  }
});
