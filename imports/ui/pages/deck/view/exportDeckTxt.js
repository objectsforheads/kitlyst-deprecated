import './exportDeckTxt.html';

Template.exportDeckTxt.onCreated(function() {
  var self = this;
  self.subscribe('allCards');
})
Template.exportDeckTxt.helpers({
  deckTextlist: function() {
    if(Session.get('deckCards') && Session.get('deckGeneral')) {
      var deck = JSON.parse(Session.get('deckCards'));
      var general = JSON.parse(Session.get('deckGeneral'));
      var txt = general[0].name + " x1";
      deck.forEach(function(card) {
        var info = allCards.findOne({id: card.id});
        txt = txt + "\n" + info.name + " x" + card.count;
      })
      return txt;
    }
    return false;
  }
})
