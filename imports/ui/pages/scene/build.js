import './build.html';
import './build.scss';

import '../database/components/card.js';

import dragula from 'dragula';
import '/node_modules/dragula/dist/dragula.min.css';

Template.scenebuilderBuild.onCreated(function() {
  var self = Template.instance();

  self.subscribe('someCards', { race: 'General' })

  self.subscribe('buildScene', FlowRouter.getParam('hash'), function(err, data) {
    if (err) {
      sAlert.error(error.reason);
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

      var defaults = {
        floors: [
          [{}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}, {}]
        ],
        units: [
          [{}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}, {}]
        ]
      }

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
          }
          if ( Object.keys(self.player2.get().floors[rowNum][colNum]).length > 0 ) {
            tile.floor = {};
            tile.floor.type = self.player2.get().floors[rowNum][colNum].type;
            tile.floor.owner = 2;
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
          }
          if ( Object.keys(self.player2.get().units[rowNum][colNum]).length > 0 ) {
            tile.unit = {};
            tile.unit.id = self.player2.get().units[rowNum][colNum].id;
            tile.unit.owner = 2;
            tile.unit.attack = self.player2.get().units[rowNum][colNum].attack || null;
            tile.unit.health = self.player2.get().units[rowNum][colNum].health || null;
          }

        })
      })

      self.field.set(field);
    }
  })

  self.editorContext = new ReactiveVar(null);
  self.galleryContext = new ReactiveVar(null);

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
    return Template.instance().field.get();
  },
  player1() {
    return Template.instance().player1.get();
  },
  player2() {
    return Template.instance().player2.get();
  },
  editorOpen() {
    return FlowRouter.getQueryParam('editing');
  },
  editorContext() {
    return Template.instance().editorContext.get() || null;
  },
  galleryContext() {
    return Template.instance().galleryContext.get() || null;
  }
})

Template.scenebuilderBuild.events({
  'click .opens-editor': function(e, template) {
    Template.instance().editorContext.set({
      type: $(e.currentTarget).attr('data-editor'),
      context: this
    });
    FlowRouter.setQueryParams({editing: this.row + this.column})

    // also set the card gallery context here
    // we could set it somewhere more publically
    // but that would also make it easier to modify client side
    // and then weird things can happen
    // which, while hilarious, is not what we really want

    // HACK this seems a little fragle - look into a better way to organize this
    if (this.unit && allCards.findOne({id: this.unit.id}).race === 'General') {
      template.galleryContext.set({race: 'General'});
    }
    return;
  },
  'click [data-editor="artifact-slot"]': function(e, template) {
    template.galleryContext.set({type: 'Artifact'});
  },
  'click .closes-editor': function(e, template) {
    template.editorContext.set(null);
    FlowRouter.setQueryParams({editing: null})
    FlowRouter.setQueryParams({gallery: null})
    return;
  },
  'click .opens-card-gallery': function(e, template) {
    FlowRouter.setQueryParams({gallery: true})
    return;
  },
  'click .closes-card-gallery': function(e, template) {
    FlowRouter.setQueryParams({gallery: null})
    return;
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

Template.scenebuilderBuild__stage.onCreated(function() {
  var self = Template.instance();
  self.draggingUnit = new ReactiveVar(null);
})

Template.scenebuilderBuild__stage.onRendered(function() {
  var self = Template.instance();
  this.drake = dragula($('.board-square').toArray());

  this.drake.on("drag", (el, target, source, sibling) => {
    // We're starting a unit dragging interaction
    // this means that the user should be able to:
    // a. click on the unit and drag it to another tile
    // b. there should be a indicator of where the unit will drop
    // c. if there's another unit on the board, replace it

    // Get the unit we're dragging
    self.draggingUnit.set(Blaze.getData(el).unit);

    // Set the tile as the drag-origin
    $(source).addClass('drag-origin');
  });

  this.drake.on("over", (el, container, source) => {
    // this.drake.cancel(true);
    // Set tile as potential drag-end
    // But only if the player has space to drop

    // Units are in a different container
    // so use row and column to target appropriately
    var row = $(container).attr('data-row');
    var column = $(container).attr('data-column');
    var unitOwner = Blaze.getData(container)
    if (!Blaze.getData(container).unit || !Blaze.getData(container).unit.owner || Blaze.getData(container).unit.owner === Blaze.getData(source).unit.owner) {
      $('.units__row:eq('+row+')').find('.unit:eq('+column+')').addClass('drag-end');
    }
  });

  this.drake.on("out", (el, container, source) => {
    // Tile is not drag end, remove class
    $('.drag-end').removeClass('drag-end');
  });

  this.drake.on("dragend", (el, target, source, sibling) => {
    this.drake.cancel(true);
    self.draggingUnit.set(null);

    // reset all drag states
    $('.drag-origin').removeClass('drag-origin');
    $('.drag-end').removeClass('drag-end');
  });

  this.drake.on("drop", (el, target, source, sibling) => {
    this.drake.cancel(true);
    // Dropping the unit on a different tile,
    // Send the unit origin data and airdop point to server
    var coordinates = {
      scene: FlowRouter.getParam('hash'),
      original: Blaze.getData(source),
      airdrop: {
        row: $(target).attr('data-row'),
        column: $(target).attr('data-column')
      }
    }
    // We don't need floor data to airdrop
    delete coordinates.original.floor;
    Meteor.call('scene__airdropUnit', coordinates)
  });
})

Template.scenebuilderBuild__stage.helpers({
  currentUnit() {
    var self = this;
    if (self.id) {
      if ( $('head').find('link[href*="css/sprites/id/' + self.id + '\.min.css"]').length === 0 ) {
        $('head').append('<link href="/css/sprites/id/' + self.id + '.min.css" rel="stylesheet">')
      }

      var card = allCards.findOne({id: self.id}) || sceneCards.findOne({id: self.id});
      for (var key in self) {
        card[key] = self[key];
      }
      return card;
    }
    return false;
  },
  draggingUnit() {
    // HACK this might be running too many times - check it
    var unit = Template.instance().draggingUnit.get();
    if (unit && unit.id) {
      var card = allCards.findOne({id: unit.id});
      card.owner = unit.owner;
      return card;
    }
    return false;
  }
})

Template.scenebuilderBuild__editor.onCreated(function() {
  var self = Template.instance();

  self.editingTarget = new ReactiveDict();
})

Template.scenebuilderBuild__editor.events({
  'keyup [name="edit-general__attack"]': function(e, template) {
    var newAttack = Number($(e.currentTarget).val());
    var oldAttack = template.editingTarget.get('attack');

    if (newAttack !== oldAttack) {
      template.editingTarget.set('attack', newAttack);
    }
  },
  'keyup [name="edit-general__health"]': function(e, template) {
    var newHealth = Number($(e.currentTarget).val());
    var oldHealth = template.editingTarget.get('health');

    if (newHealth !== oldHealth) {
      template.editingTarget.set('health', newHealth);
    }
  },
  'click .editor__change-card': function(e, template) {
    return template.editingTarget.set('id', this.id);
  },
  'click .closes-editor': function(e, template) {
    return template.editingTarget.clear()
  }
})

Template.scenebuilderBuild__editor.events({
  'click .editor__save-general': function(e, template) {
    // HACK reconsider if we should keep functions in the editor context
    // or collate them in the parent scenebuilder context

    // TODO: ownership verification
    var general = {
      scene: FlowRouter.getParam('hash'),
      owner: template.data.editorOpen.context.unit.owner,
      row: template.data.editorOpen.context.row,
      column: template.data.editorOpen.context.column,
      unit: {
        id: template.editingTarget.get('id'),
        attack: template.editingTarget.get('attack'),
        health: template.editingTarget.get('health')
      }
    }

    Meteor.call('editor__general', general, function(err, data) {
      if (err) {
        sAlert.error(error.reason);
      } else {
        FlowRouter.setQueryParams({editing: null});
        FlowRouter.setQueryParams({gallery: null});
      }
    })
  }
})

Template.scenebuilderBuild__editor.helpers({
  editorOpen() {
    return FlowRouter.getQueryParam('editing');
  },
  cardGalleryOpen() {
    return FlowRouter.getQueryParam('gallery')
  },
  editingBoardTile() {
    if (this.editorOpen && this.editorOpen.type === 'board-tile') {
      // Set editing target info if there's a unit
      if (this.editorOpen.context.unit) {
        for (var key in this.editorOpen.context.unit) {
          Template.instance().editingTarget.set(key, this.editorOpen.context.unit[key])
        }
      }
      return true;
    }
    return false;
  },
  editingArtifactSlot() {
    if (this.editorOpen && this.editorOpen.type === 'artifact-slot') {
      return true;
    }
    return false;
  },
  context() {
    console.log(this)
    return this.editorOpen.context;
  },
  galleryContext() {
    return allCards.find(this.galleryContext, {sort: {faction: 1, set:1, id: 1}});
  },
  isGeneral() {
    if (allCards.findOne({id: this.id}).race === 'General') {
      return true;
    }
    return false;
  },
  currentUnit() {
    // TODO this should actually be currentCard since we use it for all editor types
    var id = Template.instance().editingTarget.get('id');
    if (allCards.findOne({id: id})) {
      var card = allCards.findOne({id: id});

      for (var key in Template.instance().editingTarget.all()) {
        card[key] = Template.instance().editingTarget.keys[key];
      }

      return card;
    }
    return false;
  },
  currentUnit_attack() {
    return Template.instance().editingTarget.get('attack') || null;
  },
  currentUnit_health() {
    return Template.instance().editingTarget.get('health') || null;
  }
})
