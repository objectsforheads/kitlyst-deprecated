import './userLogin.html';

Template.userLogin.events({
  'submit .userLogin'(e) {
    e.preventDefault();

    let user = $('[name=loginUser]').val();
    let password = $('[name=loginPassword]').val();

    Meteor.loginWithPassword(user, password, function(error, result) {
      if (error) {
        sAlert.error(error.reason);
      }
    });
  }
})
