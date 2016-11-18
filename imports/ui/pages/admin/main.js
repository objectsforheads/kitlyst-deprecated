import './main.html';

Template.adminMain.events({
  'submit #updateCards': function(e) {
    e.preventDefault();
    Meteor.call('updateCards', $('.updateCards_password').val(), function(err, res) {
      if (err) {
        sAlert.error(err.reason);
      } else {
        if (res === true) {
          sAlert.success('updated cards');
        }
        else {
          sAlert.error('nope');
        }
      }
    })
  }
})
