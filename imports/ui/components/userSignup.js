import './userSignup.html';

Template.userSignup.onRendered(function() {
  $('.userSignup').validate({
    rules: {
      signupEmailAddress: {
        required: true,
        email: true
      },
      signupUsername: {
        required: true
      },
      signupPassword: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      emailAddress: {
        required: "Please enter your email address to sign up.",
        email: "Please enter a valid email address."
      },
      username: {
        required: "Please enter a username to sign up"
      },
      password: {
        required: "Please enter a password to sign up.",
        minlength: "Please use at least six characters."
      }
    }
  });
})

Template.userSignup.events({
  'submit .userSignup': function(e) {
    e.preventDefault();
    // Grab the user's details.
    var user = {
      email: $('[name="signupEmailAddress"]').val(),
      password: $('[name="signupPassword"]').val(),
      username: $('[name="signupUsername"]').val()
    };

    // Create the user's account.
    Accounts.createUser({email: user.email, password: user.password, username: user.username}, function( error ){
      if(error){
        sAlert.error(error.reason);
      } else {
        var userId = Meteor.userId();

        if (Session.get('userAccess') !== undefined) {
          Session.set('userAccess', false);
        }

        sAlert.success('Hello there, new friend!');
      }
    });
  }
})
