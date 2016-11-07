import './build.html';

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
  Session.set('deckCards', '[{"id":208,"count":2},{"id":209,"count":1},{"id":210,"count":3},{"id":212,"count":3},{"id":213,"count":3},{"id":214,"count":3},{"id":215,"count":3},{"id":216,"count":3},{"id":218,"count":3},{"id":219,"count":3},{"id":220,"count":3},{"id":221,"count":3}]');
  Session.set('deckCards', null);
  // These variables hold all the deck stats
  Session.set('deckManaBreakdown', null);
  Session.set('deckTypeBreakdown', null);
  Session.set('deckSpiritCost', null);
  Session.set('deckCardCount', 1)

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

      $('[data-cardId="' + card.id + '"]').attr('data-available', 3);

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






Template.drawStats.helpers({
  'twoDropCount': function() {
    return countTwoDrops();
  },
  'twoDropStat': function() {
    return percentify(drop(countTwoDrops(), 1));
  },
  'startDropData': function() {
    // We only need the stats for 3 situations: 1/2/3 copies of a card
    // So we'll create the labels based on the two drops and split them into a count
    var deck = JSON.parse(Session.get('deckCards'));
    var distribution = [{count: 1, cards: []}, {count: 2, cards: []}, {count: 3, cards: []}];

    deck.forEach(function(card) {
      // For each card, sort it into its proper distribution object
      distribution[card.count - 1].cards.push(card.id);
    })
    // If there are no cards in a distribution. clear the object from the container
    distribution = distribution.reduce(function(a,b) {
      if (b.cards.length !== 0) {
        a.push(b);
      }
      return a;
    }, [])

    return distribution;
  }
})

Template.displayStartDrawDistribution.onRendered(function() {
  // calculate the draw percentage of a card depending on its copy count
  var startDrawData = {
    labels: [this.data.count],
    series: [[
      percentifyNum(drop(this.data.count,1))
    ]]
  }

  var chart = '#drawstat-startDrawDist_' + this.data.count;
  window['startDrawChart_' + this.data.count] = new Chartist.Bar(chart,
  startDrawData, {
  chartPadding: {top: 0, left: 10, right: 30, bottom: 0},
  horizontalBars: true,
  axisY: {
    showLabel: false,
    offset: 0
  },
  axisX: {
    onlyInteger: true,
    high: 100,
    low: 0,
    divisor: 25,
    labelOffset: {
      x: -5,
      y: 0
    }
  }});
  window['startDrawChart_' + this.data.count].on('draw', function(data) {
    if(data.type === 'grid' && data.index !== 0) {
      data.element.remove();
    }

    var barHorizontalCenter, barVerticalCenter, label, value;
    if (data.type === "bar") {
      barHorizontalCenter = data.x1 + (data.element.width() * .5) + 2.5;
      barVerticalCenter = data.y1 + (data.element.height() * -1) - 10;
      value = data.element.attr('ct:value');
      if (value) {
        label = new Chartist.Svg('text');
        label.text(value + '%');
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

Template.displayStartDrawDistribution.helpers({
  'cardCount': function() {
    return this.count;
  },
  'labels': function() {
    var cards = [];
    this.cards.forEach(function(card) {
      cards.push(allCards.findOne({'id': Number(card)}))
    })
    return cards;
  },
  'drawStartDrawChart': function() {

  }
})

Template.displayTwoDropDistribution.onRendered(function() {
  var twoDropData = {
    labels: [0, 1, 2, 3, 4, 5],
    series: [[
      percentifyNum(hypergeometric(39, countTwoDrops(), 7, 0)),
      percentifyNum(hypergeometric(39, countTwoDrops(), 7, 1)),
      percentifyNum(hypergeometric(39, countTwoDrops(), 7, 2)),
      percentifyNum(hypergeometric(39, countTwoDrops(), 7, 3)),
      percentifyNum(hypergeometric(39, countTwoDrops(), 6, 4)), // You have 4, so only mulligan 1
      percentifyNum(hypergeometric(39, countTwoDrops(), 5, 5)) // You somehow drew 5 2 drops, buy a lotto ticket
    ]]
  }

  twoDropChart = new Chartist.Bar('#drawstat-twoDropDist',
  twoDropData, {
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
  twoDropChart.on('draw', function(data) {
    if(data.type === 'grid' && data.index !== 0) {
      data.element.remove();
    }

    var barHorizontalCenter, barVerticalCenter, label, value;
    if (data.type === "bar") {
      barHorizontalCenter = data.x1 + (data.element.width() * .5) + 2.5;
      barVerticalCenter = data.y1 + (data.element.height() * -1) - 10;
      value = data.element.attr('ct:value');
      if (value) {
        label = new Chartist.Svg('text');
        label.text(value + '%');
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

import dragula from 'dragula';
import '/node_modules/dragula/dist/dragula.min.css';

Template.turn1PlayChance.onCreated(function() {
  this.deck = new ReactiveVar();
  var cards = {deck:[], play: []}
  var deck = JSON.parse(Session.get('deckCards'));
  deck.forEach(function(card) {
    var info = allCards.findOne({'id': Number(card.id)});
    delete info._id;
    for (var i = 0; i < card.count; i++) {
      cards.deck.push(info);
    }
  })
  this.deck.set(cards)
})
Template.turn1PlayChance.onRendered(function() {
  this.drake = dragula([document.querySelector('#t1Play-deck-cards'), document.querySelector('#t1Play-play-cards')]);

  this.drake.on("drop", (el, target, source, sibling) => {
    this.drake.cancel(true);
    if (target !== source) {
      // Everytime we drag and drop something, we need to update this.deck
      var selection = Blaze.getData(el).info;
      var deck = this.deck.get().deck;
      var play = this.deck.get().play;

      if ($(target).hasClass('t1Play-play-cards')) {
        // We're moving a card from deck to play
        // So remove it from deck
        var cardIndex = deck.findIndex(card => card.id === selection.id);
        deck.splice(cardIndex, 1);
        // And add it to play
        play.push(selection)
      }
      else {
        // We're moving a card from play to deck
        var cardIndex = play.findIndex(card => card.id === selection.id);
        play.splice(cardIndex, 1);
        deck.push(selection)
      }

      this.deck.set({deck: deck, play: play})
    }
  });
})
Template.turn1PlayChance.helpers({
  'deck': function() {
    return Template.instance().deck.get().deck;
  },
  'play': function() {
    return Template.instance().deck.get().play;
  },
  't1PlayChance': function() {
    // Ideally, we could calculate the chance of, at minimum, getting this hand
    // ie if you draw 2x copies when you only wanted one
    // but that's hypergeometric and can always be done later
    // for now, we'll just calculate the exact probability of getting the hand
    // we could also calculate the initial replace but no

    // First we'll transform the play array into something we can use
    // Namely, an object with each key as a card id with values of want and count
    var deck = JSON.parse(Session.get('deckCards'));
    var play = Template.instance().deck.get().play;
    var hand = 0;
    play = play.reduce(function(a, b) {
      if (a[b.id]) {
        a[b.id].want++;
      }
      else {
        var cardIndex = deck.findIndex(card => card.id === b.id);
        a[b.id] = {count: deck[cardIndex].count, want: 1}
      }
      hand++;
      return a;
    }, {})

    if (hand <= 5) {
      // For each card, run the combination
      var chance = 1;
      for (var card in play) {
        chance = chance * C(play[card].count, play[card].want);
      }
      // and then any cards for the rest of the hand
      chance = chance * C(39 - hand, 7 - hand);
      // there are a total of 39C7 hands
      return Spacebars.SafeString('<span class="t1-stat-value">' + percentify(chance/C(39,7)) + '</span>');
    }
    else if (hand > 5) {
      return Spacebars.SafeString("<p>You can only have 5 cards in your starting hand!</p>");
    }
  }
})

Template.turn1Hands.onCreated(function() {
  this.count = new ReactiveVar();
  this.count.set('10');
})
Template.turn1Hands.helpers({
  'count': function() {
    return Template.instance().count.get();
  },
  'hands': function() {
    var hands = [];
    for (var i = 1; i <= Template.instance().count.get(); i++) {
      hands.push(i);
    }

    return hands;
  },
  'hand': function() {
    var hand = [];
    var deck = JSON.parse(Session.get('deckCards'));
    var cards = [];
    // set cards as a collection of unique cards
    deck.forEach(function(card) {
      var info = allCards.findOne({'id': Number(card.id)});
      delete info._id;
      for (var i = 0; i < card.count; i++) {
        cards.push(info);
      }
    })
    // draw 5
    for (var i = 0; i < 5; i++) {
      var draw = Math.floor(Math.random() * cards.length);
      hand.push(cards[draw])
      cards.splice(draw, 1);
    }
    return hand;
  }
})

Template.cardDrawDistribution.helpers({
  'cardCount': function() {
    return this.count;
  },
  'labels': function() {
    var cards = [];
    this.cards.forEach(function(card) {
      cards.push(allCards.findOne({'id': Number(card)}))
    })
    return cards;
  }
})

Template.cardDrawDistribution.onRendered(function() {
  // calculate the draw percentage of a card depending on its copy count
  // percentifyNum(drop(this.data.count,1))
  var cardDrawData = {
    labels: [],
    series: [[

    ]]
  }
  var guarantee = 0;
  var turn = 1;
  while (guarantee < 99) {
    var chance = percentifyNum(drop(this.data.count, turn));

    cardDrawData.labels.push(turn);
    cardDrawData.series[0].push(chance);
    guarantee = chance;
    turn++;
  }

  var chart = '#drawstat-cardDrawDist_' + this.data.count;
  window['cardDrawChart_' + this.data.count] = new Chartist.Bar(chart,
  cardDrawData, {
  axisY: {
    high: 100,
    low: 0,
    divisor: 25,
    onlyInteger: true
  },
  axisX: {
    onlyInteger: true
  }});
  window['cardDrawChart_' + this.data.count].on('draw', function(data) {
    if(data.type === 'grid' && data.index !== 0 && data.x1 === data.x2) {
      data.element.remove();
    }

    var barHorizontalCenter, barVerticalCenter, label, value;
    if (data.type === "bar") {
      barHorizontalCenter = data.x1 + (data.element.width() * .5) + 2.5;
      barVerticalCenter = data.y1 + (data.element.height() * -1) - 10;
      value = data.element.attr('ct:value');
      if (value) {
        label = new Chartist.Svg('text');
        label.text(value + '%');
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

Template.winConditionDistribution.onCreated(function() {
  this.deck = new ReactiveVar();
  var cards = {deck:[], play: []}
  var deck = JSON.parse(Session.get('deckCards'));
  deck.forEach(function(card) {
    var info = allCards.findOne({'id': Number(card.id)});
    delete info._id;
    for (var i = 0; i < card.count; i++) {
      cards.deck.push(info);
    }
  })
  this.deck.set(cards)

  // variables to manage the current chart stat
  // at most we support 5 cards because you need to draw the 6th
  this.charts = new ReactiveVar();
  this.charts.set({0:{}, 1:{}, 2:{}, 3:{}, 4:{}, 5:{}})
})
Template.winConditionDistribution.onRendered(function() {
  this.drake = dragula([document.querySelector('#winCondition-deck-cards'), document.querySelector('#winCondition-play-cards')]);

  this.drake.on("drop", (el, target, source, sibling) => {
    this.drake.cancel(true);
    if (target !== source) {
      // Everytime we drag and drop something, we need to update this.deck
      var selection = Blaze.getData(el).info;
      var deck = this.deck.get().deck;
      var play = this.deck.get().play;

      if ($(target).hasClass('winCondition-play-cards')) {
        // We're moving a card from deck to play
        // So remove it from deck
        var cardIndex = deck.findIndex(card => card.id === selection.id);
        deck.splice(cardIndex, 1);
        // And add it to play
        play.push(selection)
      }
      else {
        // We're moving a card from play to deck
        var cardIndex = play.findIndex(card => card.id === selection.id);
        play.splice(cardIndex, 1);
        deck.push(selection)
      }

      this.deck.set({deck: deck, play: play})

      // and force a refresh of the charts
      $('.winCondition-hand.selected').click();
    }
  });

})

Template.winConditionDistribution.helpers({
  'deck': function() {
    return Template.instance().deck.get().deck;
  },
  'play': function() {
    return Template.instance().deck.get().play;
  },
  'startHands': function() {
    // okay so we'll start with all your possible hands
    play =  Template.instance().deck.get().play;
    if (play.length > 0) {
      // every single possible combination, including duplicates
      var hands = Combinatorics.power(play).toArray();
      // sort by id order so we can dedupe
      hands = hands.reduce(function(a,b) {
        b.sort(function(c,d) {
          if (c.id < d.id) {
            return -1;
          }
          else if (c.id > d.id) {
            return 1;
          }
          return 0;
        })

        a.push(b)
        return a
      }, [])
      // dedupe by iteratively comparing all the arrays
      var dupes = [];
      hands.forEach(function(hand, index) {
        var arr1 = hand;
        for (var i = index + 1; i < hands.length; i++) {
          var arr2 = hands[i];
          var same = true;
          if (arr1.length !== arr2.length) {
            // they're not even the same length, move on
            same = false;
          }
          else {
            for (var count = 0; count < arr1.length; count++) {
              if (arr1[count] !== arr2[count]) {
                // found a difference
                same = false;
              }
            }
          }
          if (same === true && dupes.indexOf(i) === -1) {
            dupes.push(i)
          }
        }
      })
      // Sort dupes from highest to lowest index so we don't mess up splicing
      dupes.sort(function(a, b) {
        if (a > b) {
          return -1;
        }
        else if (a < b) {
          return 1;
        }
        return 0;
      })

      // Clear out duplicate hands
      dupes.forEach(function(dupe) {
        hands.splice(dupe, 1)
      })

      // now sort hands into an array of arrays based on length
      hands = hands.reduce(function(a, b) {
        // console.log(a[b.length])
        if (a[b.length] === undefined) {
          a[b.length] = [b];
        }
        else {
          a[b.length].push(b)
        }
        return a;
      }, [])

      // and pop the last hand since it's the win condition
      hands.pop();

      return hands;
    }
  }
})

Template.winConditionStats.onCreated(function() {
  this.selection = new ReactiveVar();
  this.selection.set(false);

  this.turnCount = new ReactiveVar();
  this.turnCount.set(1);
})

Template.winConditionStats.events({
  'click .winCondition-hand': function(e) {
    $(e.currentTarget).addClass('selected');
    $(e.currentTarget).siblings().removeClass('selected');
    var missing = JSON.parse(JSON.stringify(Blaze.getView($('.winCondition-stats-wrapper')[0]).templateInstance().deck.get().play));
    var hand = this;
    hand.forEach(function(selection) {
      var cardIndex = play.findIndex(card => card.id === selection.id);
      if (cardIndex !== -1) {
        missing.splice(cardIndex, 1);
      }
    })
    Template.instance().selection.set([hand, missing]);
  },
  'change .turn-count, keyup .turn-count': function(e) {
    var turnCount = Number($(e.currentTarget).val());
    if (turnCount > 0) {
      Template.instance().turnCount.set(turnCount)
    }
    else {
      Template.instance().turnCount.set(1)
    }
  }
})

Template.winConditionStats.helpers({
  'handCount': function() {
    return this[0].length;
  },
  'playCount': function() {
    return Blaze.getView($('.winCondition-stats-wrapper')[0]).templateInstance().deck.get().play.length;
  },
  'handSelected': function() {
    // got all the missing cards via template.selection
    // compress it into unique only
    if (Template.instance().selection.get() !== false) {
      // get deck info
      var deckCards = JSON.parse(Session.get('deckCards'));

      // get hand info as an object
      var hand = Template.instance().selection.get()[0];
      if (hand.length > 0) {
        hand = hand.reduce(function(a, b) {
          if (a[b.id]) {
            a[b.id].count++;
          }
          else {
            a[b.id] = {count: 1}
          }
          return a;
        }, {})
      }
      else {
        hand = {};
      }
      // get missing cards
      var missing = Template.instance().selection.get()[1];
      var uniques = missing.reduce(function(a,b) {
        var index = a.findIndex(card => card.id === b.id)
        if (index === -1) {
          a.push(b)
        }
        return a
      }, [])

      // now for each, calculate the chance of drawing it on the next turn
      var drawData = {
       labels: [],
       series: []
      }
      uniques.forEach(function(card, index) {
        var deckIndex = deckCards.findIndex(selection => selection.id === card.id);
        var count = deckCards[deckIndex].count;

        // check to see if we've drawn any already
        if (Object.keys(hand).length > 0) {
          if (hand[card.id]) {
            count -= hand[card.id].count;
          }
        }

        // count is our number of successes
        // so our number of unsuccesses is deck - count
        var turn = Template.instance().turnCount.get();
        // start contributing to drawData
        drawData.series[index] = {};
        drawData.series[index].name = card.name;
        drawData.series[index].data = [];

        var deck = deckCards.reduce(function(a, b) {
          a += b.count;
          return a;
        }, 0) - 5 - turn + 1 // deck minus the 5 we drew already and turns passed

        var chance = 1;
        var guarantee = 0;
        if (count >= deck) {
          guarantee = 1;
          if (drawData.labels.indexOf(turn) === -1) {
            drawData.labels.push(turn);
          }
          drawData.series[index].data.push(percentifyNum(guarantee))
        }
        while (guarantee < 0.99) {
          // attempt to draw
          chance = chance * ((deck - count)/deck);
          // attempt to replace
          chance = chance * ((deck - count)/deck);
          deck--;
          guarantee = 1 - chance;

          // draw Data
          if (drawData.labels.indexOf(turn) === -1) {
            drawData.labels.push(turn);
          }
          drawData.series[index].data.push(percentifyNum(guarantee))
          turn++;
        }
      })

      var chart = '#drawstat-winCondition_' + Template.instance().selection.get()[0].length;
      window[chart] = new Chartist.Bar(chart,
      drawData, {
        chartPadding: {top: 30, left: 10, right: 10, bottom: 0},
        axisY: {
          high: 100,
          low: 0,
          divisor: 25,
          onlyInteger: true,
          labelOffset: {
            x: 0,
            y: -3
          }
        },
        axisX: {
          onlyInteger: true
        },
        seriesBarDistance: 10,
        plugins: [Chartist.plugins.legend({
          removeAll: true
        })]
      });

      window[chart].on('draw', function(data) {
        if(data.type === 'grid' && data.index !== 0 && data.x1 === data.x2) {
          data.element.remove();
        }

        var barHorizontalCenter, barVerticalCenter, label, value;
        if (data.type === "bar") {
          barHorizontalCenter = data.x1 + (data.element.width() * .5) + 2.5;
          barVerticalCenter = data.y1 + (data.element.height() * -1) - 10;
          value = data.element.attr('ct:value');
          if (value) {
            label = new Chartist.Svg('text');
            label.text(value + '%');
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
    }
    return Template.instance().selection.get()[1] || Template.instance().selection.get()[1];
  }
})


Template.winConditionHand.helpers({
  'step': function() {
    if (this.length !== 0) {
      return this;
    }
    return false;
  },
  'incomplete': function() {
    if (this.length === Blaze.getView($('.winCondition-stats-wrapper')[0]).templateInstance().deck.get().play.length) {
      return false;
    }
    return true;
  },
  'missing': function() {
    var play = JSON.parse(JSON.stringify(Blaze.getView($('.winCondition-stats-wrapper')[0]).templateInstance().deck.get().play));
    var hand = this;
    hand.forEach(function(selection) {
      var cardIndex = play.findIndex(card => card.id === selection.id);
      if (cardIndex !== -1) {
        play.splice(cardIndex, 1);
      }
    })

    return play;
  }
})




function percentify(number) {
  return (number * 100).toFixed(2) + '%'
}

function percentifyNum(number) {
  return (number * 100).toFixed(2);
}

function countTwoDrops() {
  var deck = JSON.parse(Session.get('deckCards'));
  var count = 0;
  deck.forEach(function(card) {
    var info = allCards.findOne({'id': Number(card.id)});
    if (info.type === 'Unit' && info.manaCost <= 2) {
      count+= card.count;
    }
  })

  return count;
}

// N = cards in deck
// k = number of successful cards
// n = draws
// x = number of successes in draw
// Hypergeometric distribution
function hypergeometric(N, k, n, x) {
  var kCx = factorial(k) / (factorial(k-x) * factorial(x));
  var NkCnx = factorial(N-k) / (factorial((N-k) - (n-x)) * factorial(n-x));
  var NCn = factorial(N) / (factorial(N-n) * factorial(n));

  var p = kCx * NkCnx / NCn;
  return p;
}

function factorial(number) {
  if (number === 0) {
    return 1;
  }
  else if (number < 0) {
    return false;
  }
  return (number * factorial(number-1));
}





// N = cards in deck
// k = number of successful cards
// n = draws
// x = number of successes in draw
// Drop returns the chance of getting a COUNT of cards by a number of TURNS
function drop(count, turns) {
  var chance = [];
  var deck = 39;
  // chance of not getting it on draw
  chance.push(hypergeometric(deck, count, 5, 0));
  deck -= 5;
  // according to the devs, mulligan doesn't let you re-draw your mulligan
  // chance of not getting it on first mulligan draw
  deck--;
  chance.push((deck - count)/deck);
  // second mulligan draw
  deck--;
  chance.push((deck - count)/deck);
  // but you do replace those 2 afterward
  deck += 2;
  // replace on opener
  deck++;
  chance.push((deck - count)/deck);
  deck--;


  // but wait, there's more!
  for (var i = 1; i <= turns - 1; i++) {
    // Keep drawing, friend
    deck--;
    chance.push((deck - count)/deck);
    // And remember, you have a replace every turn
    deck++;
    chance.push((deck - count)/deck);
    deck--;
  }

  chance = chance.reduce(function(a, b) {
    return a * b;
  })

  return 1 - chance;
}
function C(n, r) {
  return factorial(n)/(factorial(r) * factorial(n-r));
}
