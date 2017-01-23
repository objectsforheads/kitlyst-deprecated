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
  }, {
  	"id": 20174,
  	"faction": "Lyonar Kingdoms",
  	"rarity": "Token",
  	"name": "Roar",
  	"description": "Give a minion nearby your General +2 Attack.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20175,
  	"faction": "Lyonar Kingdoms",
  	"rarity": "Token",
  	"name": "Afterglow",
  	"description": "Restore 3 Health to any Minion.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20176,
  	"faction": "Songhai Empire",
  	"rarity": "Token",
  	"name": "Blink",
  	"description": "Teleport a friendly minion up to 2 spaces.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20177,
  	"faction": "Songhai Empire",
  	"rarity": "Token",
  	"name": "Arcane Heart",
  	"description": "Summon a Heartseeker nearby your General.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20178,
  	"faction": "Vetruvian Imperium",
  	"rarity": "Token",
  	"name": "Iron Shroud",
  	"description": "Summon a 2/2 Iron Dervish on a random space nearby your General.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20179,
  	"faction": "Vetruvian Imperium",
  	"rarity": "Token",
  	"name": "Psionic Strike",
  	"description": "Your General deals double damage to minions this turn.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20180,
  	"faction": "Abyssian Host",
  	"rarity": "Token",
  	"name": "Shadowspawn",
  	"description": "Summon 2 Wraithlings nearby your General.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20181,
  	"faction": "Abyssian Host",
  	"rarity": "Token",
  	"name": "Abyssal Scar",
  	"description": "Deal 1 damage to a minion. If it dies this turn, the space turns into Shadow Creep.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20182,
  	"faction": "Magmar Aspects",
  	"rarity": "Token",
  	"name": "Overload",
  	"description": "Give your General +1 Attack.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20183,
  	"faction": "Magmar Aspects",
  	"rarity": "Token",
  	"name": "Seeking Eye",
  	"description": "Both players draw a card.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20184,
  	"faction": "Vanar Kindred",
  	"rarity": "Token",
  	"name": "Warbird",
  	"description": "Deal 2 damage to all enemies in the enemy General's Column.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
  	"set": "Base"
  }, {
  	"id": 20185,
  	"faction": "Vanar Kindred",
  	"rarity": "Token",
  	"name": "Kinetic Surge",
  	"description": "Any minion you summon this turn gains +1/+1.",
  	"manaCost": 1,
  	"type": "Spell",
  	"race": "Spell",
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
  generalBBS() {
    var id = this.player.bbs.id;
    return sceneCards.findOne({id: id});
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
