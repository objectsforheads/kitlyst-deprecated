import './view.html';
import './view/exportDeckTxt.js';
import './view/exportDeckImg.js';

Template.deckView.onCreated(function() {
  var self = this;
  self.subscribe('allCards');
  self.subscribe('viewDeck', FlowRouter.getParam('hash'));
  self.autorun(function() {
    if (typeof Decks.findOne() !== 'undefined') {
      Tracker.nonreactive(function(){
        Session.set('deckManaBreakdown', 0);
        Session.set('deckTypeBreakdown', 0);
        Session.set('deckSpiritCost', 0);
        Session.set('deckCardCount', 1);

        if (Decks.findOne().deck) {
          Session.set('deckCards', JSON.stringify(Decks.findOne().deck));
          Session.set('deckGeneral', JSON.stringify(Decks.findOne().general));
          Session.set('deckFaction', Decks.findOne().faction);

          Decks.findOne().deck.forEach(function(card) {
            var info = allCards.findOne({id: card.id});
            Session.set('deckCardCount', Session.get('deckCardCount') + card.count);
            editDeckStat('mana', 'add', info.manaCost, card.count);
            editDeckStat('type', 'add', info.type, card.count);
            editDeckStat('spirit', 'add', info.rarity, card.count);
          })
        }
      });
    }
  })
})

Template.deckView.helpers({
  'factionSlug': function() {
    var faction = Session.get('deckFaction');
    switch(faction) {
      case 'Lyonar Kingdoms':
        faction = 'lyonar';
        break;
      case 'Songhai Empire':
        faction = 'songhai';
        break
      case 'Vetruvian Imperium':
        faction = 'vetruvian';
        break
      case 'Abyssian Host':
        faction = 'abyssian';
        break
      case 'Magmar Aspects':
        faction = 'magmar';
        break
      case 'Vanar Kindred':
        faction = 'vanar';
        break
    }
    return faction;
  },
  'compactView': function() {
    return FlowRouter.getQueryParam('compact');
  },
  'compactLandscape': function() {
    if (FlowRouter.getQueryParam('compact') === 'landscape') {
      return true;
    }
    return false;
  },
  'compactPortrait': function() {
    if (FlowRouter.getQueryParam('compact') === 'portrait') {
      return true;
    }
    return false;
  },
  'deckValid': function() {
    if (Session.get('deckCardCount') === 40) {
      return true;
    }
    return false;
  },
  'deckError': function() {
    if (Session.get('deckCardCount') > 40) {
      return "Your deck has too many cards. Remove " + (Session.get('deckCardCount') - 40) + " to enable stats."
    }
    else if (Session.get('deckCardCount') < 40) {
      return "Your deck doesn't have enough cards. Add " + (40 - Session.get('deckCardCount')) + " to enable stats."
    }
    return false;
  },
  'deckName': function() {
    return Decks.findOne().name;
  },
  'deckGeneral': function() {
    return Decks.findOne().general[0].name;
  },
  'generalHalfImgUrl': function() {
    var general = Decks.findOne().general[0];
    switch (general.id) {
      case 1:
        return "/assets/img/generals/hex_f1_half.png";
        break;
      case 23:
        return "/assets/img/generals/hex_f1-alt_half.png";
        break;
      case 101:
        return "/assets/img/generals/hex_f2_half.png";
        break;
      case 123:
        return "/assets/img/generals/hex_f2-alt_half.png";
        break;
      case 201:
        return "/assets/img/generals/hex_f3_half.png";
        break;
      case 223:
        return "/assets/img/generals/hex_f3-alt_half.png";
        break;
      case 301:
        return "/assets/img/generals/hex_f4_half.png";
        break;
      case 323:
        return "/assets/img/generals/hex_f4-alt_half.png";
        break;
      case 401:
        return "/assets/img/generals/hex_f5_half.png";
        break;
      case 418:
        return "/assets/img/generals/hex_f5-alt_half.png";
        break;
      case 501:
        return "/assets/img/generals/hex_f6_half.png";
        break;
      case 527:
        return "/assets/img/generals/hex_f6-alt_half.png";
        break;
    }
  },
  'generalImgUrl': function() {
    var general = Decks.findOne().general[0];
    switch (general.id) {
      case 1:
        return "/assets/img/generals/hex_f1.png";
        break;
      case 23:
        return "/assets/img/generals/hex_f1-alt.png";
        break;
      case 101:
        return "/assets/img/generals/hex_f2.png";
        break;
      case 123:
        return "/assets/img/generals/hex_f2-alt.png";
        break;
      case 201:
        return "/assets/img/generals/hex_f3.png";
        break;
      case 223:
        return "/assets/img/generals/hex_f3-alt.png";
        break;
      case 301:
        return "/assets/img/generals/hex_f4.png";
        break;
      case 323:
        return "/assets/img/generals/hex_f4-alt.png";
        break;
      case 401:
        return "/assets/img/generals/hex_f5.png";
        break;
      case 418:
        return "/assets/img/generals/hex_f5-alt.png";
        break;
      case 501:
        return "/assets/img/generals/hex_f6.png";
        break;
      case 527:
        return "/assets/img/generals/hex_f6-alt.png";
        break;
    }
  },
  'deckCardTypes': function() {
    var cards = Session.get('deckCards');
    if (cards) {
      cards = JSON.parse(Session.get('deckCards'));
      cards = cards.map(function(card) {
        var info = allCards.findOne({'id': Number(card.id)});
        info.count = card.count;
        return info;
      })
    }
    cards = cards.sort(function(a, b) {
      if (a.manaCost < b.manaCost) {
        return -1;
      }
      else if (a.manaCost > b.manaCost) {
        return 1;
      }
      else {
        return 0;
      }
    })

    cards = cards.reduce(function(a, b) {
      switch (b.type) {
        case 'Artifact':
          a[0].deck.push(b);
          break;
        case 'Spell':
          a[1].deck.push(b);
          break;
        case 'Unit':
          a[2].deck.push(b);
          break;
      }

      return a;
    }, [{cardType: 'Artifacts', deck: []},{cardType: 'Spells', deck: []},{cardType: 'Units', deck: []}])
    return cards
  },
  'deckHasType': function() {
    // context is deckCardType
    if (this.deck.length !== 0) {
      return true;
    }
    return false;
  },
  'availableCards': function() {
    var cards = [];
    Decks.findOne().deck.forEach(function(card) {
      cards.push(allCards.findOne({id: card.id}));
    })
    return cards;
  }
})




function editDeckStat(stat, modifier, modified, count) {
  switch(stat) {
    case 'mana':
      var manaBreakdown = Session.get('deckManaBreakdown');
      if (manaBreakdown) {
        manaBreakdown = JSON.parse(manaBreakdown);
      }
      else {
        // Initialize the object if it doesn't exist
        manaBreakdown = {};
      }
      if (modifier === 'add') {
        manaBreakdown[modified] = manaBreakdown[modified] ? manaBreakdown[modified] + count : count;
      }
      else if (modifier === 'subtract') {
        manaBreakdown[modified] = manaBreakdown[modified] - count
        if (manaBreakdown[modified] === 0) {
          delete manaBreakdown[modified];
        }
      }

      Session.set('deckManaBreakdown', JSON.stringify(manaBreakdown));

      // Update the mana breakdown chart
      var manaData = {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'],
        series: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
      }
      for (var manaCost in manaBreakdown) {
        if (Number(manaCost) >= 10) {
          manaData.series[0][10] = manaData.series[0][10] + manaBreakdown[manaCost];
        }
        else {
          manaData.series[0][manaCost] = manaBreakdown[manaCost];
        }
      }
      Session.set('deckManaChartData', manaData);

      break
    case 'type':
      var typeBreakdown = Session.get('deckTypeBreakdown');
      if (typeBreakdown) {
        typeBreakdown = JSON.parse(typeBreakdown);
      }
      else {
        // Initialize the object if it doesn't exist
        typeBreakdown = {};
      }
      if (modifier === 'add') {
        typeBreakdown[modified] = typeBreakdown[modified] ? typeBreakdown[modified] + count : count;
      }
      else if (modifier === 'subtract') {
        typeBreakdown[modified] = typeBreakdown[modified] - count
        if (typeBreakdown[modified] === 0) {
          delete typeBreakdown[modified];
        }
      }

      Session.set('deckTypeBreakdown', JSON.stringify(typeBreakdown));
      break
    case 'spirit':
      var spiritCost = Session.get('deckSpiritCost');
      if (spiritCost) {
        spiritCost = JSON.parse(spiritCost);
      }
      else {
        // Initialize the object if it doesn't exist
        spiritCost = {};
      }
      if (modifier === 'add') {
        spiritCost[modified] = spiritCost[modified] ? spiritCost[modified] + count : count;
      }
      else if (modifier === 'subtract') {
        spiritCost[modified] = spiritCost[modified] - count
        if (spiritCost[modified] <= 0) {
          delete spiritCost[modified];
        }
      }

      Session.set('deckSpiritCost', JSON.stringify(spiritCost));
      break
  }
}
