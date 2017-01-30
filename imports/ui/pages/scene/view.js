import './view.html';
import './view.scss';

import '../database/components/card.js';

Template.scenebuilderView.onCreated(function() {
  var self = Template.instance();

  self.subscribe('someCards', { race: 'General' })

  self.subscribe('viewScene', FlowRouter.getParam('hash'), function(err, data) {
    if (err) {
      sAlert.error(err.reason);
    } else {
      self.player1 = new ReactiveVar(null);
      self.player2 = new ReactiveVar(null);
      self.field = new ReactiveVar(null)
    }
  })

  self.autorun(()=> {
    if (Scenes.findOne()) {
      self.player1.set(Scenes.findOne().player1);
      self.player2.set(Scenes.findOne().player2);

      self.subscribe('someCards', { $or: [
        { faction: { $in: [
          allCards.findOne({id: self.player1.get().general.id}).faction,
          allCards.findOne({id: self.player2.get().general.id}).faction,
          'Neutral'
        ] } },
        { race: 'General' }
      ] });

      var defaults = Scenes.findOne().meta.board;

      var field = [
        [{}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}, {}, {}, {}, {}]
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
          if ( Object.keys(self.player1.get().floors[rowNum][colNum]).length > 0 ) {
            tile.floor = {};
            tile.floor.type = self.player1.get().floors[rowNum][colNum].type;
            tile.floor.owner = 1;
            // if they own shadowcreep, remove the mana spring unit
            if (tile.floor.type === 'shadowcreep') {
              defaults.units[rowNum][colNum] = {};
            }
          }
          if ( Object.keys(self.player2.get().floors[rowNum][colNum]).length > 0 ) {
            tile.floor = {};
            tile.floor.type = self.player2.get().floors[rowNum][colNum].type;
            tile.floor.owner = 2;
            // if they own shadowcreep, ensure that the mana spring unit is removedremove the mana spring unit
            if (tile.floor.type === 'shadowcreep') {
              defaults.units[rowNum][colNum] = {};
            }
          }

          // place the units (p2 > p1 > default)
          if ( Object.keys(defaults.units[rowNum][colNum]).length > 0 ) {
            tile.unit = {};
            tile.unit.id = defaults.units[rowNum][colNum].id;
            tile.unit.attack = defaults.units[rowNum][colNum].attack || null;
            tile.unit.health = defaults.units[rowNum][colNum].health || null;
          }
          if ( Object.keys(self.player1.get().units[rowNum][colNum]).length > 0 ) {
            tile.unit = {};
            tile.unit.id = self.player1.get().units[rowNum][colNum].id;
            tile.unit.owner = 1;
            tile.unit.attack = self.player1.get().units[rowNum][colNum].attack || null;
            tile.unit.health = self.player1.get().units[rowNum][colNum].health || null;
            defaults.units[rowNum][colNum] = {};
          }
          if ( Object.keys(self.player2.get().units[rowNum][colNum]).length > 0 ) {
            tile.unit = {};
            tile.unit.id = self.player2.get().units[rowNum][colNum].id;
            tile.unit.owner = 2;
            tile.unit.attack = self.player2.get().units[rowNum][colNum].attack || null;
            tile.unit.health = self.player2.get().units[rowNum][colNum].health || null;
            defaults.units[rowNum][colNum] = {};
          }

        })
      })
      self.field.set(field);
    }
  })

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

Template.scenebuilderView.helpers({
  perspective() {
    return FlowRouter.getQueryParam('player');
  },
  field() {
    return Template.instance().field.get();
  },
  player1() {
    return Template.instance().player1.get();
  },
  player2() {
    return Template.instance().player2.get();
  }
})

Template.scenebuilderView__stage.helpers({
  loadCardSprite() {
    // add sprite CSS if not yet added
    if (this.id) {
      if ( $('head').find('link[href*="css/sprites/id/' + this.id + '\.min.css"]').length === 0 ) {
        $('head').append('<link href="/css/sprites/id/' + this.id + '.min.css" rel="stylesheet">')
      }
    }
    return;
  }
})

Template.scenebuilderView__player.helpers({
  generalBBS() {
    var id = this.player.bbs.id;
    return sceneCards.findOne({id: id});
  },
  playerManaslots() {
    var manaslots = [];
    var manabar = this.player.manabar
    var total = manabar.total > manabar.available ? manabar.total : manabar.available;
    var used = manabar.total > manabar.available ? manabar.total - manabar.available : 0;

    for (var i = 1; i <= 9; i++) {
      var manaslot = {active: false, used: false}
      if (i <= total) {
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
  manaUsed() {
    var mana = this.player.manabar.total - this.player.manabar.available;
    if (mana < 0) {
      mana = 0;
    }
    return mana;
  },
  manaRemaining() {
    return this.player.manabar.available
  },
  handCount() {
    var count = 0;
    this.player.actionbar.forEach(function(card) {
      if (card.id) {
        count++;
      }
    })
    return count;
  },
  playerArtifacts() {
    var player = this.player.id;
    var artifacts = this.player.artifacts;

    artifacts.forEach(function(artifact, index) {
      artifact.owner = player;
      artifact.slot = index;
    })

    return artifacts;
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
  },
  playerActionbar() {
    var player = this.player;
    var actionbar = player.actionbar;

    actionbar.forEach(function(card, index) {
      card.owner = player.id;
      card.index = index;
    })

    return actionbar;
  }
})
