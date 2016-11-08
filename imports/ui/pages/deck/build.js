import './build.html';

import './view/stats.js';

import '../../css/faction/lyonar.css';
import '../../css/faction/songhai.css';
import '../../css/faction/vetruvian.css';
import '../../css/faction/abyssian.css';
import '../../css/faction/magmar.css';
import '../../css/faction/vanar.css';
import '../../css/faction/neutral.css';

import Chartist from 'chartist';
import '/node_modules/chartist/dist/chartist.min.css';
require('chartist-plugin-legend');

Template.deckBuild.onCreated(function() {
  // Set up variables
  //  Check what frame is active - stats or add
  Session.set('statsEnabled', false);
  //  These variables are the basis of the deck
  Session.set('deckFaction', null);
  Session.set('deckGeneral', null);
  //  This variable holds all the card ids in the deck
  Session.set('deckCards', null);
  // These variables hold all the deck stats
  Session.set('deckManaBreakdown', null);
  Session.set('deckTypeBreakdown', null);
  Session.set('deckSpiritCost', null);
  Session.set('deckCardCount', 1);

  // states
  Session.set('importingDeck', false);

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
    return JSON.parse(Session.get('deckGeneral'));
  },
  'statsEnabled': function() {
    return Session.get('statsEnabled');
  }
})





Template.deckMods.helpers({
  'deckGeneral': function() {
    return JSON.parse(Session.get('deckGeneral'));
  }
})

Template.deckMods.events({
  'click .changeGeneral': function(e) {
    Session.set('deckGeneral', null);
  },
  'click .deleteDeck': function(e) {
    Session.set('deckCards', null);
    Session.set('deckManaBreakdown', null);
    Session.set('deckTypeBreakdown', null);
    Session.set('deckSpiritCost', null);
    Session.set('deckCardCount', 1)
    manaChart.update({
      labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'],
      series: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    })
  }
})










Template.navDeckbuilderFilters.onRendered(function() {
  var filter_manaCost = document.getElementById('filter_manaCost');
  noUiSlider.create(filter_manaCost, {
    start: [0, 25],
    margin: 1,
    step: 1,
    connect: true,
    range: {
      'min': 0,
      'max': 25
    },
    pips: {
      mode: 'positions',
      values: [0, 25, 50, 75, 100],
      density: 3.84615384615// 100/(23-2) % per section
    },
    format: {
      to: function ( value ) {
      return value;
      },
      from: function ( value ) {
      return value;
      }
    }
  });
  filter_manaCost.noUiSlider.on('change', function() {
    var range = filter_manaCost.noUiSlider.get();
    var current = Session.get('deckbuilderFilters');
    current.manaCost = {'$gte': range[0], '$lte': range[1]};
    Session.set('deckbuilderFilters', current);
  })

  var filter_attack = document.getElementById('filter_attack');
  noUiSlider.create(filter_attack, {
    start: [0, 12],
    margin: 1,
    step: 1,
    connect: true,
    range: {
      'min': 0,
      'max': 12
    },
    pips: {
      mode: 'positions',
      values: [0, 25, 50, 75, 100],
      density: 10 // 100/(12-2) % per section
    },
    format: {
      to: function ( value ) {
      return value;
      },
      from: function ( value ) {
      return value;
      }
    }
  });
  filter_attack.noUiSlider.on('change', function() {
    var range = filter_attack.noUiSlider.get();
    var current = Session.get('deckbuilderFilters');
    current.attack = {'$gte': range[0], '$lte': range[1]};
    Session.set('deckbuilderFilters', current);
  })

  var filter_health = document.getElementById('filter_health');
  noUiSlider.create(filter_health, {
    start: [0, 15],
    margin: 1,
    step: 1,
    connect: true,
    range: {
      'min': 0,
      'max': 15
    },
    pips: {
      mode: 'positions',
      values: [0,20,40,60,80,100],
      density: 7.69230769231 // 100/(15-2) % per section
    },
    format: {
      to: function ( value ) {
      return value;
      },
      from: function ( value ) {
      return value;
      }
    }
  });
  filter_health.noUiSlider.on('change', function() {
    var range = filter_health.noUiSlider.get();
    var current = Session.get('deckbuilderFilters');
    current.health = {'$gte': range[0], '$lte': range[1]};
    Session.set('deckbuilderFilters', current);
  })
})





Template.importDeck.onCreated(function() {
  this.deckImportInput = new ReactiveVar(null);
  this.deckImportOutput = new ReactiveVar();
})

Template.importDeck.helpers({
  'importing': function() {
    return Session.get('importingDeck');
  },
  'deckImportSuccesses': function() {
    if (Template.instance().deckImportOutput.get()) {
      return Template.instance().deckImportOutput.get().matches;
    }
    return false;
  },
  'deckImportErrors': function() {
    if (Template.instance().deckImportOutput.get()) {
      return Template.instance().deckImportOutput.get().errors;
    }
    return false;
  },
  'deckImportWrongFaction': function() {
    if (Template.instance().deckImportOutput.get()) {
      return Template.instance().deckImportOutput.get().wrongFaction;
    }
    return false;
  }
})

Template.importDeck.events({
  'click .importDeck': function() {
    var cards = Template.instance().deckImportOutput.get().matches;
    cards = cards.reduce(function(a, b) {
      a.push({
        id: b.id,
        count: b.count
      })

      // update stats
      Session.set('deckCardCount', Session.get('deckCardCount') + b.count);
      editDeckStat('mana', 'add', b.manaCost, b.count);
      editDeckStat('type', 'add', b.type, b.count);
      editDeckStat('spirit', 'add', b.rarity, b.count);

      return a;
    }, [])

    Session.set('deckCards', JSON.stringify(cards));
    Session.set('importingDeck', false);
    Template.instance().deckImportOutput.set(null);
  },
  'click .cancelImport': function() {
    Session.set('importingDeck', false);
    Template.instance().deckImportOutput.set(null);
  },
  'change .deck-import-input, keyup .deck-import-input': function(e) {
    var matches = [];
    var errors = [];
    var wrongFaction = [];

    // Once a deck has been imported, split the input on a newline
    var input = $(e.currentTarget).val().trim();
    input = input.split('\n');

    // split them into a card name and count
    input = input.reduce(function(a,b) {
      if (b.trim().length !== 0) {
        var stripCount = /^[0-9]x|x[0-9]$/;
        var count = stripCount.exec(b);

        if (count) {
          var name = b.replace(count, '').trim();
          count = Number(count[0].replace('x', ''));

          if (typeof count === "number") {
            a.push({
              name: name,
              count: count
            })
          }
        }
        else {
          errors.push({
            name: b,
            count: 0
          })
        }
      }

      return a;
    }, [])

    // for each found input, find a card for it
    input.forEach(function(card) {
      var match = allCards.findOne({
        'name': card.name
      });
      if (match) {
        if (match.race !== 'General') {
          match.count = card.count || 0;

          if (match.faction !== Session.get('deckFaction') && match.faction !== 'Neutral') {
            wrongFaction.push(match);
          }
          else {
            matches.push(match);
          }
        }
      }
      else {
        errors.push({
          name: card.name,
          count: card.count
        })
      }
    })

    Template.instance().deckImportOutput.set({matches: matches, errors: errors, wrongFaction: wrongFaction});
  }
})





Template.deckList.helpers({
  'deckExists': function() {
    if (Session.get('deckCardCount') > 1) {
      return true;
    }
    return false;
  },
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
  'click .importDeck': function(e) {
    Session.set('importingDeck', !Session.get('importingDeck'));
    return Session.get('importingDeck');
  },
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
      }
      if (card.count === 0) {
        deck.splice(cardIndex, 1);
      }
      // Update deck stats
      editDeckStat('mana', 'subtract', this.manaCost, 1)
      editDeckStat('type', 'subtract', this.type, 1)
      editDeckStat('spirit', 'subtract', this.rarity, 1)

      Session.set('deckCardCount', Session.get('deckCardCount') - 1)

      Session.set('deckCards', JSON.stringify(deck));
    }

    // Remove all copies of card
    if ($(e.currentTarget).hasClass('removeCard-all')) {
      deck.splice(cardIndex, 1)
      editDeckStat('mana', 'subtract', this.manaCost, this.count)
      editDeckStat('type', 'subtract', this.type, this.count)
      editDeckStat('spirit', 'subtract', this.rarity, this.count)

      Session.set('deckCardCount', Session.get('deckCardCount') - this.count)

      Session.set('deckCards', JSON.stringify(deck));
    }
  }
})

Template.deckStats.onRendered(function() {
  var manaData = {
    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'],
    series: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
  }
  if (Session.get('deckManaBreakdown')) {
    var manaBreakdown = JSON.parse(Session.get('deckManaBreakdown'));
    for (var manaCost in manaBreakdown) {
      if (Number(manaCost) >= 10) {
        manaData.series[0][10] = manaData.series[0][10] + manaBreakdown[manaCost];
      }
      else {
        manaData.series[0][manaCost] = manaBreakdown[manaCost];
      }
    }
  }
  manaChart = new Chartist.Bar('#deckstat-manaCost',
  manaData, {
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
  'deckCardCount': function() {
    return Session.get('deckCardCount');
  },
  'overDeckCardCount': function() {
    if (Session.get('deckCardCount') > 40) {
      return true;
    }
    else {
      return false;
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





Template.addCards.onCreated(function() {
  // This variable holds the card filter
  Session.set('deckbuilderFilters', {});
})

Template.addCards.helpers({
  'availableFactionCards': function() {
    var cardFilter = Session.get('deckbuilderFilters');
    var addFilter = {
      'race': {$ne: 'General'},
      'faction': Session.get('deckFaction')
    }
    for (var filter in addFilter) {
      cardFilter[filter] = addFilter[filter];
    }
    return allCards.find(cardFilter).fetch();
  },
  'availableNeutralCards': function() {
    var cardFilter = Session.get('deckbuilderFilters');
    var addFilter = {
      'faction': 'Neutral'
    }
    for (var filter in addFilter) {
      cardFilter[filter] = addFilter[filter];
    }
    return allCards.find(cardFilter).fetch();
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
    // Check if a deck is already in progress and if the faction changes
    var currentFaction = Session.get('deckFaction');
    var newFaction = this.info.faction;
    if (currentFaction !== newFaction && currentFaction) {
      // If the faction is different, clear the current deck
      if (Session.get('deckCards')) {
        var currentDeck = JSON.parse(Session.get('deckCards'));

        // Implement a custom forEach loop here to traverse backward
        // So that splice doesn't cause index skipping
        for (var i = currentDeck.length - 1; i >= 0; i--) {
          var check = allCards.findOne({'id': Number(currentDeck[i].id)});
          if (check.faction !== newFaction && check.faction !== 'Neutral') {
            // Remember to update the stats
            editDeckStat('mana', 'subtract', check.manaCost, currentDeck[i].count)
            editDeckStat('type', 'subtract', check.type, currentDeck[i].count)
            editDeckStat('spirit', 'subtract', check.rarity, currentDeck[i].count)

            currentDeck.splice(i, 1);
          }
        }
        Session.set('deckCards', JSON.stringify(currentDeck))
      }
    }
    Session.set('deckFaction', this.info.faction);
    return Session.set('deckGeneral', JSON.stringify([this.info]));
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

      Session.set('deckCardCount', Session.get('deckCardCount') + 1)
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





Template.builderStateToggle.helpers({
  'statsAvailable': function() {
    if (Session.get('deckCardCount') === 40) {
      return true;
    }
    else {
      return false;
    }
  }
})

// Event delegation

// Create tooltip for min view cards
$('body').on('mouseenter', '[data-layout="layout-min"] .has-tooltip:not(.tooltipstered)', function() {
  $(this)
    .tooltipster({
      contentAsHTML: true,
      delay: 0,
      contentCloning: true,
      side: ['top', 'bottom', 'right', 'left']
    })
    .tooltipster('open');
});


// Create tooltip for list view cards
$('body').on('mouseenter', '[data-layout="layout-list"] .has-tooltip:not(.tooltipstered)', function() {
  $(this)
    .tooltipster({
      contentAsHTML: true,
      delay: 0,
      contentCloning: true,
      side: ['left', 'top', 'bottom', 'right']
    })
    .tooltipster('open');
});

// Disable tooltips for full view cards
$('body').on('mouseenter', '[data-layout="layout-full"].tooltipstered', function() {
  $(this).tooltipster('destroy')
})

$('body').on('click', '.deck-info-toggle', function() {
  $('.deckbuilder-container').toggleClass('min-info');
})
$('body').on('click', '.deckbuilder-settings-toggle', function() {
  $('.deckbuilder-container').toggleClass('settings-open')
})
$('body').on('click', '.deckbuilder-filters-toggle', function() {
  $('.deckbuilder-container').toggleClass('filters-open')
})

$('body').on('click' ,'#type-filter_artifact', function(e) {
  $('.deckbuilder').attr('data-showArtifacts', $(e.currentTarget).prop('checked'))
})
$('body').on('click' ,'#type-filter_spell', function(e) {
  $('.deckbuilder').attr('data-showSpells', $(e.currentTarget).prop('checked'))
})
$('body').on('click' ,'#type-filter_unit', function(e) {
  $('.deckbuilder').attr('data-showUnits', $(e.currentTarget).prop('checked'))
})

$('body').on('click', '.set-deckbuilder-view:not(".active")', function(e) {
  e.preventDefault();
  $('.set-deckbuilder-view').removeClass('active');
  $(e.currentTarget).addClass('active');

  if ($(e.currentTarget).attr('data-view') === 'layout-full') {
    $('.deckbuilder .tooltipstered').tooltipster('destroy');
  }
  $('.deckbuilder').attr('data-layout', $(e.currentTarget).attr('data-view'));

})

$('body').on('click', '#range-filter_attack', function(e) {
  if ($(e.currentTarget).prop('checked')) {
    filter_attack.removeAttribute('disabled');
    var range = filter_attack.noUiSlider.get();
    var current = Session.get('deckbuilderFilters');
    current.attack = {'$gte': range[0], '$lte': range[1]};
    Session.set('deckbuilderFilters', current);
  }
  else {
    filter_attack.setAttribute('disabled', true);
    var current = Session.get('deckbuilderFilters');
    delete current.attack;
    Session.set('deckbuilderFilters', current);
  }
})

$('body').on('click', '#range-filter_manaCost', function(e) {
  if ($(e.currentTarget).prop('checked')) {
    filter_manaCost.removeAttribute('disabled');
    var range = filter_manaCost.noUiSlider.get();
    var current = Session.get('deckbuilderFilters');
    current.manaCost = {'$gte': range[0], '$lte': range[1]};
    Session.set('deckbuilderFilters', current);
  }
  else {
    filter_manaCost.setAttribute('disabled', true);
    var current = Session.get('deckbuilderFilters');
    delete current.manaCost;
    Session.set('deckbuilderFilters', current);
  }
})


$('body').on('click', '#range-filter_health', function(e) {
  if ($(e.currentTarget).prop('checked')) {
    filter_health.removeAttribute('disabled');
    var range = filter_health.noUiSlider.get();
    var current = Session.get('deckbuilderFilters');
    current.health = {'$gte': range[0], '$lte': range[1]};
    Session.set('deckbuilderFilters', current);
  }
  else {
    filter_health.setAttribute('disabled', true);
    var current = Session.get('deckbuilderFilters');
    delete current.health;
    Session.set('deckbuilderFilters', current);
  }
})

$('body').on('keyup change', '.deckbuilder-search', function(e) {
  var searches = $(e.currentTarget).val().trim();
  $('.deckbuilder-search-styles').html('');
  if (searches) {
    // Do work
    searches = searches.split(',');
    searches.forEach(function(search) {
      search = search.trim();
      if (search) {
        if (search.indexOf('id:') !== -1) {
          var id = slugify(search.split('id:')[1]);
          $('.deckbuilder-search-styles').append('.deckbuilder-card:not([data-cardid*="' + id + '"]) { display: none; }')
        }
        else if (search.indexOf('race:') !== -1) {
          var race = slugify(search.split('race:')[1]);
          $('.deckbuilder-search-styles').append('.deckbuilder-card:not([data-race*="' + race + '"]) { display: none; }')
        }
        else {
          var name = slugify(search);
          $('.deckbuilder-search-styles').append('.deckbuilder-card:not([data-cardName*="' + name + '"]) { display: none; }')
        }
      }
    })
  }

  function slugify(str) {
    return str.trim().toLowerCase().replace(/['"]+/, "").replace(/[^a-zA-Z0-9]+/,"-").replace("/--/", "-");
  }
})

$('body').on('click', '[name="builder-state"]:checked', function(e) {
  if (JSON.parse($(e.currentTarget).val()) === true) {
    $('.deckbuilder-container').addClass('min-info');
  }
  else {
    $('.deckbuilder-container').removeClass('min-info');
  }
  Session.set('statsEnabled', JSON.parse($(e.currentTarget).val()));
})
