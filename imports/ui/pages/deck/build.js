import './build.html';

import '../../css/faction/lyonar.css';
import '../../css/faction/songhai.css';
import '../../css/faction/vetruvian.css';
import '../../css/faction/abyssian.css';
import '../../css/faction/magmar.css';
import '../../css/faction/vanar.css';
import '../../css/faction/neutral.css';

Template.deckBuild.onCreated(function() {
  // Set up variables
  //  These variables are the basis of the deck
  Session.set('deckFaction', null);
  Session.set('deckGeneral', null);
  //  This variable holds all the card ids in the deck
  Session.set('deckCards', null);
  // These variables hold all the deck stats
  Session.set('deckManaBreakdown', null);
  Session.set('deckTypeBreakdown', null);
  Session.set('deckSpiritCost', null);

  // Pull cards from API
  allCards = new Mongo.Collection(null);
  var apiUrl = 'http://listlyst.com/api/v1/cards?apikey=' + 'cf156a2e4b5296b5a184e53ab14dd99f';

  HTTP.get(apiUrl, {}, function(err, res)  {
    if (err) {
      // Something's gone wrong!
      console.log("Something's gone wrong!")
    }
    else {
      var arrayCards = res.data;
      arrayCards.forEach(function(card) {
        allCards.insert(card);
      })
    }
  })
})

Template.deckBuild.helpers({
  'generalSelected': function() {
    return Session.get('deckGeneral')
  }
})





Template.deckList.helpers({
  'deckCards': function() {
    var cards = Session.get('deckCards');
    if (cards) {
      cards = JSON.parse(Session.get('deckCards'));
      cards = cards.map(function(card) {
        var info = allCards.findOne({'id': Number(card.id)});
        info.count = card.count;
        return info;
      })
    }
    return cards
  }
})

Template.deckList.events({
  'click .modCardCount': function(e) {
    var deck = JSON.parse(Session.get('deckCards'));
    var cardIndex = deck.findIndex(card => card.id === this.id);
    var card = deck[cardIndex];

    // Add a copy of the card if possible
    if ($(e.currentTarget).hasClass('addCard-1')) {
      $('.addCard[data-cardId="' + card.id + '"]').click();
    }

    // Remove 1 card
    if ($(e.currentTarget).hasClass('removeCard-1')) {
      if (card.count > 0) {
        card.count = card.count - 1;
        $('[data-cardId="' + card.id + '"]').attr('data-available', 3 - card.count);
      }
      if (card.count === 0) {
        deck.splice(cardIndex, 1);
        $('[data-cardId="' + card.id + '"]').attr('data-available', 3);
      }
      // Update deck stats
      editDeckStat('mana', 'subtract', this.manaCost, 1)
      editDeckStat('type', 'subtract', this.type, 1)
      editDeckStat('spirit', 'subtract', this.rarity, 1)

      Session.set('deckCards', JSON.stringify(deck));
    }

    // Remove all copies of card
    if ($(e.currentTarget).hasClass('removeCard-all')) {
      deck.splice(cardIndex, 1)
      editDeckStat('mana', 'subtract', this.manaCost, this.count)
      editDeckStat('type', 'subtract', this.type, this.count)
      editDeckStat('spirit', 'subtract', this.rarity, this.count)

      $('[data-cardId="' + card.id + '"]').attr('data-available', 3);

      Session.set('deckCards', JSON.stringify(deck));
    }
  }
})

Template.deckStats.onRendered(function() {
  manaChart = new Chartist.Bar('#deckstat-manaCost', {
    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'],
    series: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
  }, {
  chartPadding: {top: 40, left: 0, right: 5, bottom: 0},
  axisY: {
    showLabel: false,
    showGrid: true,
    onlyInteger: true,
    offset: 0
  },
  axisX: {
    showGrid:false
  }});
  manaChart.on('draw', function(data) {
    if(data.type === 'grid' && data.index !== 0) {
      data.element.remove();
    }

    var barHorizontalCenter, barVerticalCenter, label, value;
    if (data.type === "bar") {
      barHorizontalCenter = data.x1 + (data.element.width() * .5) - 5;
      barVerticalCenter = data.y1 + (data.element.height() * -1) - 10;
      value = data.element.attr('ct:value');
      if (value !== '0') {
        label = new Chartist.Svg('text');
        label.text(value);
        label.addClass("ct-barlabel");
        label.attr({
          x: barHorizontalCenter,
          y: barVerticalCenter,
          'text-anchor': 'middle'
        });
        return data.group.append(label);
      }
    }
  });
})
Template.deckStats.helpers({
  'typeUnitCount': function() {
    var typeBreakdown = Session.get('deckTypeBreakdown');
    if (typeBreakdown) {
      return JSON.parse(typeBreakdown).Unit || '0';
    }
    else {
      return '0';
    }
  },
  'typeSpellCount': function() {
    var typeBreakdown = Session.get('deckTypeBreakdown');
    if (typeBreakdown) {
      return JSON.parse(typeBreakdown).Spell || '0';
    }
    else {
      return '0';
    }
  },
  'typeArtifactCount': function() {
    var typeBreakdown = Session.get('deckTypeBreakdown');
    if (typeBreakdown) {
      return JSON.parse(typeBreakdown).Artifact || '0';
    }
    else {
      return '0';
    }
  },
  'spiritCost': function() {
    var breakdown = Session.get('deckSpiritCost')
    if (breakdown) {
      breakdown = JSON.parse(Session.get('deckSpiritCost'));
      var costs = {
        'Basic': 0,
        'Common': 40,
        'Rare': 100,
        'Epic': 350,
        'Legendary': 900
      }

      var cost = 0;
      for (var rarity in breakdown) {
        cost = cost + costs[rarity]*breakdown[rarity];
      }
      return cost;
    }
    else {
      return 0;
    }
  }
})





Template.addCards.helpers({
  'availableFactionCards': function() {
    return allCards.find({ 'race': {$ne: 'General'}, 'faction': Session.get('deckFaction') }).fetch();
  },
  'availableNeutralCards': function() {
    return allCards.find({ 'faction': 'Neutral' }).fetch();
  }
})





Template.selectGeneral.onCreated(function() {
  this.passFaction = new ReactiveVar(null);
})

Template.selectGeneral.helpers({
  'factions': function() {
    return ['Lyonar Kingdoms', 'Abyssian Host', 'Magmar Aspects', 'Vetruvian Imperium', 'Vanar Kindred', 'Songhai Empire'];
  },
  'passFaction': function() {
    return Template.instance().passFaction.set(this)
  },
  'getFaction': function() {
    return Template.instance().passFaction.get()
  },
  'factionGenerals': function() {
    return allCards.find({ 'race': 'General', 'faction': this.toString() }).fetch();
  }
})

Template.card.events({
  'click .general-choice': function() {
    Session.set('deckFaction', this.info.faction);
    return Session.set('deckGeneral', this.info.id);
  },
  'click .addCard': function(e) {
    var deck = Session.get('deckCards');
    var cardId = this.info.id;
    var added = false;

    // Initialize the deck if we haven't added any cards
    if (deck) {
      deck = JSON.parse(deck);
    }
    else {
      deck = [];
    }

    // Add the selected card to the deck if it hasn't already been capped
    var cardExists = deck.findIndex(card => card.id === cardId);

    if (cardExists !== -1) {
      var count = deck[cardExists].count;
      if (count >= 3) {
        deck[cardExists].count = 3;
      }
      else {
        added = true;
        deck[cardExists].count = deck[cardExists].count + 1;
      }
    }
    else {
      added = true;
      deck.push({'id': cardId, 'count': 1})
    }
    Session.set('deckCards', JSON.stringify(deck));

    // Update the deck stats if a card was added
    if (added) {
      editDeckStat('mana', 'add', this.info.manaCost, 1)
      editDeckStat('type', 'add', this.info.type, 1)
      editDeckStat('spirit', 'add', this.info.rarity, 1)

      var count = Number($(e.currentTarget).attr('data-available'))
      $(e.currentTarget).attr('data-available', count - 1)
    }
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
      manaChart.update(manaData);

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

// Event delegation
$('body').on('mouseenter', '.deckbuilder-cards .has-tooltip:not(.tooltipstered)', function() {
  $(this)
    .tooltipster({
      contentAsHTML: true,
      delay: 0,
      contentCloning: true,
      side: ['top', 'bottom', 'right', 'left']
    })
    .tooltipster('open');
});

$('body').on('mouseenter', '.decklist-card .has-tooltip:not(.tooltipstered)', function() {
  $(this)
    .tooltipster({
      contentAsHTML: true,
      delay: 0,
      contentCloning: true,
      side: ['left', 'top', 'bottom', 'right']
    })
    .tooltipster('open');
});

$('body').on('click', '.deck-info-toggle', function() {
  $('.deckbuilder').toggleClass('min-info');
})
