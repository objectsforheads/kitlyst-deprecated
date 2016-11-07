import './stats.html'

import dragula from 'dragula';
import '/node_modules/dragula/dist/dragula.min.css';

import Chartist from 'chartist';
import '/node_modules/chartist/dist/chartist.min.css';
require('chartist-plugin-legend');

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
