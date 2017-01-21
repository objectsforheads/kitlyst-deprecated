import './build.html';
import './build.scss';

import '../database/components/card.js';

Template.scenebuilderBuild.onCreated(function() {
  var self = Template.instance();

  self.subscribe('someCards', {});

  self.board = new ReactiveVar({
    field: [
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
  })

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
    ]
  });
})

Template.scenebuilderBuild.helpers({
  field() {
    return Template.instance().board.get().field;
  },
  units() {
    var player1 = Template.instance().player1.get().units;
    var player2 = Template.instance().player2.get().units;

    var units = [
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
