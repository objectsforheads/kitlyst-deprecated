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
  },
  'submit #updateMeta': function(e) {
    e.preventDefault();

    var info = $(e.currentTarget).serializeArray();
    info = info.reduce(function(a, b) {
      a[b.name] = b.value;

      return a;
    }, {})

    info.updateMeta_meta = JSON.parse(info.updateMeta_meta);

    Meteor.call('updateMeta', info, function(err, res) {
      if (err) {
        sAlert.error(err.reason);
      } else {
        if (res === true) {
          sAlert.success('updated cards');
        }
        else {
          sAlert.error('blugh');
        }
      }
    })
  }
})
