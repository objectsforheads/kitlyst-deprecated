import './exportDeckImg.html';

Template.exportDeckImg.onCreated(function() {
  this.deckExported = new ReactiveVar(false);
  this.exportingImg = new ReactiveVar(false);
  this.deckImageUrl = new ReactiveVar(null);
})

Template.exportDeckImg.helpers({
  'deckExported': function() {
    return Template.instance().deckExported.get();
  },
  'exportingImg': function() {
    return Template.instance().exportingImg.get();
  },
  'deckImageUrl': function() {
    return Template.instance().deckImageUrl.get();
  }
})

Template.exportDeckImg.events({
  'click .exportDeckImg': function() {
    var self = Template.instance();
    self.exportingImg.set(true);

    var startDeckSaveTemp = sAlert.info("Generating your deck view for export...", {timeout: 'none'});

    var args = {
      url: null,
      orientation: $('[name="deck-export_orientation"]:checked').val()
    }
    // generate a temporary draft for the deck
    let deck = {
      name: $('.deck-draft-name').val() || Decks.findOne().name,
      faction: Session.get('deckFaction'),
      general: JSON.parse(Session.get('deckGeneral')),
      deck: JSON.parse(Session.get('deckCards')),
      draft: 'temp'
    }
    Meteor.call('saveDeckDraft', deck, function(err, data) {
      sAlert.close(startDeckSaveTemp);
      if (err) {
        sAlert.error(err.reason);
      }
      else {
        if (typeof data.hash === 'string') {
          var startDeckExportTemp = sAlert.info('View generated. Uploading to imgur...', {timeout: 'none'});
          args.url = window.location.host + '/deck/view/' + data.view_hash;
          Meteor.call('exportDeckImg', args, function(err, res) {
            self.exportingImg.set(false);
            sAlert.close(startDeckExportTemp);
            if (err) {
              sAlert.error(err.reason);
            }
            else {
              if (res.success === true && res.status === 200) {
                self.deckExported.set(true);
                self.deckImageUrl.set(res.data.link);
                sAlert.success("Deck successfully uploaded to imgur!");
              } else {
                sAlert.error("Something went wrong! Please try again.");
              }
            }
          })
        }
        else {
          for (var validation in data) {
            if (data[validation] === false) {
              sAlert.error(validation + ' failed to validate');
            }
          }
        }
      }
      Meteor.call('cleanTempDrafts', null);
    });
  }
})
