import './build.html';
import './build.scss';

import '../database/components/card.js';

Template.scenebuilderBuild.onCreated(function() {
  var self = Template.instance();

  self.subscribe('someCards', {});

  self.player1 = new ReactiveVar({
    id: 1,
    name: 'Player 1',
    general: {
      id: 401,
      health: 25
    },
    bbs: {
      id: 'general-bbs_f5',
      cost: 1,
      cooldown: 2,
      remaining: 0
    },
    manabar: {
      available: 4,
      used: 4
    },
    hand: 3,
    deck: {
      remaining: 17,
      total: 40
    },
    artifacts: [
      {id: 30012, durability: 1},
      {id: 30012, durability: 2},
      {id: 30012, durability: 3}
    ],
    actionbar: [
      {id: 30012},
      {id: 424},
      {id: 1},
      {id: 11067},
      {id: null},
      {id: null}
    ],
    units: [
      [
        {id: 1}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ]
    ],
    floors: [
      [
        {type: 'shadowcreep'}, {type: 'shadowcreep'}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ]
    ]
  });

  self.player2 = new ReactiveVar({
    id: 2,
    name: 'Player 2',
    general: {
      id: 418,
      health: 25
    },
    bbs: {
      id: 'general-bbs_f5-alt',
      cost: 1,
      cooldown: 2,
      remaining: 2
    },
    manabar: {
      available: 4,
      used: 2
    },
    hand: 3,
    deck: {
      remaining: 17,
      total: 30
    },
    artifacts: [
      {id: 30012, durability: 1},
      {id: 30012, durability: 2},
      {id: false, durability: 3}
    ],
    actionbar: [
      {id: 424},
      {id: 424},
      {id: 424},
      {id: 424},
      {id: null},
      {id: null}
    ],
    units: [
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {id: 1}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ]
    ],
    floors: [
      [
        {type: 'shadowcreep'}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ]
    ]
  });
})

Template.scenebuilderBuild.helpers({
  field() {
    var player1 = Template.instance().player1.get();
    var player2 = Template.instance().player2.get();

    var floors = [
      [
        {}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}, {}
      ]
    ]

    var field = [
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ],
      [
        {}, {}, {}, {}, {}, {}, {}, {}, {}
      ]
    ]

    // For each row
    field.forEach(function(row, rowNum) {
      // For each column
      row.forEach(function(tile, colNum) {
        // set the row and column position
        tile.row = rowNum.toString();
        tile.column = colNum.toString();

        // if there's a floor modifier, apply that (p2 > p1 > default)
        if ( Object.keys(floors[rowNum][colNum]).length > 0 ) {
          tile.floor = {};
          tile.floor.type = floors[rowNum][colNum].type;
        }
        if ( Object.keys(player1.floors[rowNum][colNum]).length > 0 ) {
          tile.floor = {};
          tile.floor.type = player1.floors[rowNum][colNum].type;
          tile.floor.owner = 1;
        }
        if ( Object.keys(player2.floors[rowNum][colNum]).length > 0 ) {
          tile.floor = {};
          tile.floor.type = player2.floors[rowNum][colNum].type;
          tile.floor.owner = 2;
        }

        // place the units (p2 > p1)
        if ( Object.keys(player1.units[rowNum][colNum]).length > 0 ) {
          tile.unit = {};
          tile.unit.id = player1.units[rowNum][colNum].id;
          tile.unit.owner = 1;
        }
        if ( Object.keys(player2.units[rowNum][colNum]).length > 0 ) {
          tile.unit = {};
          tile.unit.id = player2.units[rowNum][colNum].id;
          tile.unit.owner = 2;
        }

      })
    })

    return field;
  },
  units() {




    // For each row
    units.forEach(function(row, rowNum) {
      // For each column
      row.forEach(function(column, colNum) {
        if ( Object.keys(player1[rowNum][colNum]).length > 0 ) {
          units[rowNum][colNum] = player1[rowNum][colNum];
          units[rowNum][colNum].player = 1;
        }
        else if ( Object.keys(player2[rowNum][colNum]).length > 0 ) {
          units[rowNum][colNum] = player2[rowNum][colNum];
          units[rowNum][colNum].player = 2;
        }
      })
    })

    return units;
  },
  player1() {
    return Template.instance().player1.get();
  },
  player2() {
    return Template.instance().player2.get();
  }
})

Template.scenebuilderBuild__player.helpers({
  playerManaslots() {
    var manaslots = [];
    var available = this.player.manabar.available;
    var used = this.player.manabar.used;
    for (var i = 1; i <= 9; i++) {
      var manaslot = {active: false, used: false}
      if (i <= available) {
        manaslot.active = true;
      }
      if (i <= used) {
        manaslot.used = true;
      }

      manaslots.push(manaslot);
    }

    if (this.player.id === 2) {
      manaslots.reverse();
    }
    return manaslots;
  },
  manaRemaining() {
    return this.player.manabar.available - this.player.manabar.used;
  },
  loadCurrentArtifact() {
    // add sprite CSS if not yet added
    if ( $('head').find('link[href*="css/sprites/id/' + this.id + '\.min.css"]').length === 0 ) {
      $('head').append('<link href="/css/sprites/id/' + this.id + '.min.css" rel="stylesheet">')
    }
    return;
  },
  currentCard() {
    // add sprite CSS if not yet added
    if (this.id) {
      if ( $('head').find('link[href*="css/sprites/id/' + this.id + '\.min.css"]').length === 0 ) {
        $('head').append('<link href="/css/sprites/id/' + this.id + '.min.css" rel="stylesheet">')
      }
      return allCards.findOne({id: this.id});
    }
    return false;
  }
})

Template.scenebuilderBuild__stage.helpers({
  currentUnit() {
    if (this.id) {
      if ( $('head').find('link[href*="css/sprites/id/' + this.id + '\.min.css"]').length === 0 ) {
        $('head').append('<link href="/css/sprites/id/' + this.id + '.min.css" rel="stylesheet">')
      }
      return allCards.findOne({id: this.id});
    }
    return false;
  }
})
