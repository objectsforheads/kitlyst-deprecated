import './build.html';
import './build.scss';

import '../database/components/card.js';

Template.scenebuilderBuild.onCreated(function() {
  var self = Template.instance();

  self.subscribe('someCards', {});

  self.subscribe('buildScene', FlowRouter.getParam('hash'), function(err, data) {
    if (err) {
      sAlert.error(error.reason);
    } else {
      self.player1 = new ReactiveVar(Scenes.findOne().player1);
      self.player2 = new ReactiveVar(Scenes.findOne().player2);
    }
  })

  // TODO look into if this collection is persistent across the session
  // scenebuilder specific units
  sceneCards = new Mongo.Collection(null);
  [{
  	"id": "scene_manaspring",
  	"faction": "Neutral",
  	"rarity": "Token",
  	"name": "Mana Spring",
  	"description": "Gain +1 Mana this turn.",
  	"manaCost": 0,
  	"type": "Unit",
  	"race": "Tile",
  	"set": "Base"

  }, {
  	"id": "scene_shadowcreep",
  	"faction": "Abyssian Host",
  	"rarity": "Token",
  	"name": "Shadow Creep Tile",
  	"description": "Deals damage to enemy minions and Generals standing on it at the end of owner's turn.",
  	"manaCost": 0,
  	"type": "Unit",
  	"race": "Tile",
  	"attack": 1,
  	"set": "Base"
  }].forEach(function(card) {
    sceneCards.insert(card);
  });
})

Template.scenebuilderBuild.helpers({
  field() {
    var player1 = Template.instance().player1.get();
    var player2 = Template.instance().player2.get();

    var defaults = {
      floors: [
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
      ],
      units: [
        [
          {}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}, {}
        ],
        [
          {}, {}, {}, {}, {}, {}, {}, {}, {}
        ],
        [
          {}, {}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}
        ],
        [
          {}, {}, {}, {}, {}, {}, {}, {}, {}
        ],
        [
          {}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}, {}
        ]
      ]
    }

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
        if ( Object.keys(defaults.floors[rowNum][colNum]).length > 0 ) {
          tile.floor = {};
          tile.floor.type = defaults.floors[rowNum][colNum].type;
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

        // place the units (p2 > p1 > default)
        if ( Object.keys(defaults.units[rowNum][colNum]).length > 0 ) {
          tile.unit = {};
          tile.unit.id = defaults.units[rowNum][colNum].id;
        }
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
      return allCards.findOne({id: this.id}) || sceneCards.findOne({id: this.id});
    }
    return false;
  }
})
