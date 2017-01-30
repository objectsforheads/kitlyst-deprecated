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

      Meteor.call('scene__setBoard', {scene: FlowRouter.getParam('hash'), board: defaults});
      self.field.set(field);
    }
  })

  self.editorContext = new ReactiveVar(null);
  self.galleryContext = new ReactiveVar(null);
  self.locationContext = new ReactiveVar(null);

  self.galleryFilterFaction = new ReactiveVar(null);

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

  // meta editor variables
  self.canEditShadowCreep = new ReactiveVar(false);
  self.shadowCreepOwner = new ReactiveVar(1);
  self.addingShadowCreep = new ReactiveVar(false);
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
  },
  locationContext() {
    return Template.instance().locationContext.get() || null;
  },
  canEditShadowCreep() {
    if (Template.instance().canEditShadowCreep.get() && typeof Template.instance().shadowCreepOwner.get() === 'number') {
      return true;
    }
    return false;
  }
})

Template.scenebuilderBuild.events({
  'click .opens-editor': function(e, template) {
    FlowRouter.setQueryParams({editing: this.row + this.column})
    FlowRouter.setQueryParams({gallery: true})
    return;
  },
  'click [data-editor="board-tile"]': function(e, template) {
    template.editorContext.set({
      type: $(e.currentTarget).attr('data-editor'),
      context: this
    });
    if (this.unit && allCards.findOne({id: this.unit.id}) && allCards.findOne({id: this.unit.id}).race === 'General') {
      template.galleryContext.set({race: 'General'});
    } else {
      template.galleryContext.set({type: 'Unit', 'race': {$ne: 'General'}});
    }
  },
  'click [data-editor="artifact-slot"]': function(e, template) {
    template.galleryContext.set({type: 'Artifact'});
    // HACK probably a better way to do this than check DOM location
    // so when refactoring, also remove the data-player and
    // data-index attributes from .general-artifact
    template.locationContext.set({
      owner: Number($(e.currentTarget).attr('data-player')),
      slot: Number($(e.currentTarget).attr('data-index'))
    })
    template.editorContext.set({
      type: $(e.currentTarget).attr('data-editor'),
      context: this
    });
  },
  'click [data-editor="actionbar"]': function(e, template) {
    template.galleryContext.set({'race': {$ne: 'General'}});
    template.editorContext.set({
      type: $(e.currentTarget).attr('data-editor'),
      context: this.player.actionbar
    });
  },
  'click [data-player]': function(e, template) {
    var locationContext = template.locationContext.get() || {};
    locationContext.owner = Number($(e.currentTarget).attr('data-player'));
    template.locationContext.set(locationContext);
  },
  'click .closes-editor': function(e, template) {
    template.editorContext.set(null);
    FlowRouter.setQueryParams({editing: null})
    FlowRouter.setQueryParams({gallery: null})

    // HACK forcibly resetting the gallery filter to 'all'
    $('[name="gallery-filter__faction"]').last().prop('checked', true);
    return;
  },
  'click [name="gallery-filter__faction"]': function(e, template) {
    var filters = template.galleryContext.get();
    delete filters.faction;
    var faction = document.querySelector('input[name="gallery-filter__faction"]:checked').value || null;
    if (faction && faction !== 'All') {
      filters.faction = faction;
    }

    template.galleryContext.set(filters);
  },
  'click .opens-card-gallery': function(e, template) {
    FlowRouter.setQueryParams({gallery: true})
    return;
  },
  'click .closes-card-gallery': function(e, template) {
    FlowRouter.setQueryParams({gallery: null})
    return;
  },
  'click #meta-editor__can-edit-shadowcreep': function(e, template) {
    template.canEditShadowCreep.set(e.currentTarget.checked);
  },
  'click [name="shadowcreep-owner"]': function(e, template) {
    template.shadowCreepOwner.set(Number(document.querySelector('input[name="shadowcreep-owner"]:checked').value));
  },
  'mousedown .can-edit-shadowcreep .board-square': function(e, template) {
    template.addingShadowCreep.set(true);
    if (template.addingShadowCreep.get()) {
      Meteor.call('metaEditor__shadowcreep', {
        scene: FlowRouter.getParam('hash'),
        edit: 'add',
        owner: template.shadowCreepOwner.get(),
        tile: Blaze.getData(e.currentTarget)
      }, function(err, data) {
        if (err) {
          template.addingShadowCreep.set(false);
          sAlert.error(err.reason);
        }
      })
    }
    return false;
  },
  'mouseenter .can-edit-shadowcreep .board-square': function(e, template) {
    if (template.addingShadowCreep.get()) {
      Meteor.call('metaEditor__shadowcreep', {
        scene: FlowRouter.getParam('hash'),
        edit: function(){
          if (template.shadowCreepOwner.get() !== 0) {return 'add';}
          return 'remove'
        }(),
        owner: template.shadowCreepOwner.get(),
        tile: Blaze.getData(e.currentTarget)
      }, function(err, data) {
        if (err) {
          template.addingShadowCreep.set(false);
          sAlert.error(err.reason);
        }
      })
    }
  },
  'mouseup .can-edit-shadowcreep, mouseleave .can-edit-shadowcreep': function(e, template) {
    template.addingShadowCreep.set(false);
  }
})

Template.scenebuilderBuild__player.events({
  'click .general-artifact__durability': function(e, template) {
    e.stopPropagation();
    // this = {id, durability, owner, slot}
    Meteor.call('editor__artifact-durability', {
      scene: FlowRouter.getParam('hash'),
      artifact: this
    }, function(err) {
      if (err) { sAlert.error(err.reason); }
    })
  },
  'click .bbs__cooldown': function(e, template) {
    var player = this.player;
    Meteor.call('editor__bbs-cooldown', {
      scene: FlowRouter.getParam('hash'),
      owner: player.id,
      cooldown: player.bbs.cooldown,
      remaining: player.bbs.remaining
    }, function(err) {
      if (err) { sAlert.error(err.reason); }
    })
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
  handCount() {
    var count = 0;
    this.player.actionbar.forEach(function(card) {
      if (card.id) {
        count++;
      }
    })
    return count;
  },
  generalBBS() {
    var id = this.player.bbs.id;
    return sceneCards.findOne({id: id});
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

Template.scenebuilderBuild__stage.onCreated(function() {
  var self = Template.instance();
  self.draggingUnit = new ReactiveVar(null);
})

Template.scenebuilderBuild__stage.onRendered(function() {
  var self = Template.instance();
  this.drake = dragula(
    $('.draggable').toArray(),
    $('.board-square').toArray()
  );

  this.drake.on("drag", (el, target, source, sibling) => {
    // We're starting a unit dragging interaction
    // this means that the user should be able to:
    // a. click on the unit and drag it to another tile
    // b. there should be a indicator of where the unit will drop
    // c. if there's another unit on the board, replace it

    // Get the unit we're dragging
    self.draggingUnit.set(Blaze.getData(el).unit || Blaze.getData(el));

    // Set the tile as the drag-origin
    $(source).addClass('drag-origin');
  });

  this.drake.on("over", (el, container, source) => {
    // Units are in a different container
    // so use row and column to target appropriately
    var row = $(container).attr('data-row');
    var column = $(container).attr('data-column');

    // Set tile as potential drag-end
    $('.units__row:eq('+row+')').find('.unit:eq('+column+')').addClass('drag-end');
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
    // Make sure generals are immune to replacement
    var tile = Blaze.getData(target);
    if (!tile.unit || !tile.unit.owner || allCards.findOne({id:tile.unit.id}).race !== 'General') {
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
    }
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
      if (card) {
        for (var key in self) {
          card[key] = self[key];
        }
        return card;
      }
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
  self.viewingSingle = new ReactiveVar(false);
  self.locationContext = new ReactiveVar(null);

  self.actionBarTemp = new ReactiveVar(null);

  self.galleryFilters = new ReactiveVar(null);

  Meteor.call('currentFactions', {
    scene: FlowRouter.getParam('hash')
  }, function(err, data) {
    if (err) {
      sAlert.error(err.reason);
    } else {
      return self.galleryFilters.set(data);
    }
  })
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
      if (newHealth <= 0) {
        sAlert.warning("Minimum general health is 1");
        $(e.currentTarget).val(1)
        return template.editingTarget.set('health', 1);
      }
      if (newHealth > 25) {
        sAlert.warning("Maximum general health is 25");
        $(e.currentTarget).val(25)
        return template.editingTarget.set('health', 25);
      }
      return template.editingTarget.set('health', newHealth);
    }
  },
  'keyup [name="edit-unit__attack"]': function(e, template) {
    var newAttack = Number($(e.currentTarget).val());
    var oldAttack = template.editingTarget.get('attack');

    if (newAttack !== oldAttack) {
      template.editingTarget.set('attack', newAttack);
    }
  },
  'keyup [name="edit-unit__health"]': function(e, template) {
    var newHealth = Number($(e.currentTarget).val());
    var oldHealth = template.editingTarget.get('health');

    if (newHealth !== oldHealth) {
      if (newHealth <= 0) {
        sAlert.warning("Minimum unit health is 1");
        $(e.currentTarget).val(1)
        return template.editingTarget.set('health', 1);
      }
      return template.editingTarget.set('health', newHealth);
    }
  },
  'click .editor__delete-unit': function(e, template) {
    template.editingTarget.clear();
  },
  'click .editor__destroy-artifact': function(e, template) {
    template.editingTarget.set('id', null);
  },
  'click .editor__set-to-update-actionbar-card': function(e, template) {
    template.locationContext.set($(e.currentTarget).attr('data-location'));
    if (this.id) {
      template.editingTarget.set('id', this.id);
    }
  },
  'click .editor__destroy-actionbar-card': function(e, template) {
    template.editingTarget.set('id', null);
  },
  'click .editor__update-actionbar-card': function(e, template) {
    var actionBar = template.actionBarTemp.get();
    var toChange = template.locationContext.get();
    actionBar[toChange].id = template.editingTarget.get('id');

    // unset the editing target now that we've saved it
    template.editingTarget.clear();

    return template.actionBarTemp.set(actionBar);
  },
  'click .editor__change-card': function(e, template) {
    // HACK this may be a hack - it depends on if
    // there are alternative use cases in which viewingSingle's
    // functional purpose goes beyond "actionbar or actionbar card"
    if (template.viewingSingle.get() === false) {
      var actionbar = template.actionBarTemp.get();
      for (var i = 0; i < actionbar.length; i++) {
        if (!actionbar[i].id) {
          actionbar[i].id = this.id;
          template.actionBarTemp.set(actionbar);
          break;
        }
      }
    } else {
      return template.editingTarget.set('id', this.id);
    }
  },
  'click .closes-editor': function(e, template) {
    template.viewingSingle.set(false);
    template.actionBarTemp.set(null);
    template.editingTarget.set('id', null)
    return template.editingTarget.clear()
  },
  'click .opens-single-card-view': function(e, template) {
    return template.viewingSingle.set(true);
  },
  'click .exits-single-card-view': function(e, template) {
    return template.viewingSingle.set(false);
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
        template.viewingSingle.set(false);
        template.editingTarget.clear();
        // HACK accessing parent event
        // because for some reason, contexts are being
        // consistent throughout view swaps
        // although arguably it is better to maintain
        // one function which we would pull right now,
        // were the parent context not necessary
        $('.closes-editor').click();
      }
    })
  },
  'click .editor__save-tile': function(e, template) {
    var tile = {
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
    Meteor.call('editor__tile', tile, function(err, data) {
      if (err) {
        sAlert.error(err.reason);
      } else {
        template.viewingSingle.set(false);
        template.editingTarget.clear();
        // HACK accessing parent event
        $('.closes-editor').click();
      }
    })
  },
  'click .editor__save-artifact': function(e, template) {
    var artifact = {
      scene: FlowRouter.getParam('hash'),
      owner: template.data.locationContext.owner,
      slot: template.data.locationContext.slot,
      id: template.editingTarget.get('id'),
      durability: template.editingTarget.get('durability')
    }
    Meteor.call('editor__artifact', artifact, function(err, data) {
      if (err) {
        sAlert.error(err.reason);
      } else {
        template.viewingSingle.set(false);
        template.editingTarget.clear();
        // HACK accessing parent event
        $('.closes-editor').click();
      }
    })
  },
  'click .editor__save-actionbar': function(e, template) {
    var actionbar = {
      scene: FlowRouter.getParam('hash'),
      owner: template.data.locationContext.owner,
      actionbar: template.actionBarTemp.get()
    }
    Meteor.call('editor__actionbar', actionbar, function(err, data) {
      if (err) {
        sAlert.error(err.reason);
      } else {
        template.viewingSingle.set(false);
        template.actionBarTemp.set(null);
        template.editingTarget.clear();
        // HACK accessing parent event
        $('.closes-editor').click();
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
      Template.instance().viewingSingle.set(true);
      return true;
    }
    return false;
  },
  editingArtifactSlot() {
    if (this.editorOpen && this.editorOpen.type === 'artifact-slot') {
      for (var key in this.editorOpen.context) {
        if (key !== 'owner') {
          Template.instance().editingTarget.set(key, this.editorOpen.context[key])
        }
      }
      Template.instance().viewingSingle.set(true);
      return true;
    }
    return false;
  },
  editingActionBar() {
    if (this.editorOpen && this.editorOpen.type === 'actionbar') {
      var temp = Template.instance().actionBarTemp;
      var original = Template.instance().data.editorOpen.context;
      if (temp.get() === null) {
        var actionbar = [];
        // duplicating the original actionbaor for use in temporary situations
        // TODO see if this is the most efficient way of duplicating
        // TODO this may be a bug involving object references vs duplication
        // it may exist in the other data types, although not so prominently
        // check them later in the refactor
        for (var i = 0; i < original.length; i++) {
          actionbar[i] = {id: original[i].id || null};
        }
        temp.set(actionbar);
      }
      return true;
    }
    return false;
  },
  context() {
    return this.editorOpen.context;
  },
  galleryFilters() {
    // HACK this works, but it can only filter for factions
    // refactor it to allow for multiple filter types
    return Template.instance().galleryFilters.get();
  },
  galleryContext() {
    var filters = {sort: {faction: 1, manaCost: 1, name: 1}};
    return allCards.find(this.galleryContext, filters).fetch();
  },
  isGeneral() {
    var id = Template.instance().editingTarget.get('id');
    if (allCards.findOne({id:id}) && allCards.findOne({id:id}).race === 'General') {
      return true;
    }
    return false;
  },
  currentUnit() {
    // TODO this should actually be currentCard since we use it for all editor types
    var id = Template.instance().editingTarget.get('id') || this.id;
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
  },
  viewingSingle() {
    return Template.instance().viewingSingle.get()
  },
  actionBarTemp() {
    return Template.instance().actionBarTemp.get();
  }
})

Template.cardGallery.onCreated(function() {
  let self = Template.instance();

  // How many items per page
  self.perPage = new ReactiveVar(Number(self.data.perPage));
  // The current page rendered
  self.currentPage = new ReactiveVar(1);
  // The total number of pages (dynamic)
  self.pageCount = new ReactiveVar();
  self.cardCount = new ReactiveVar(0);
})

var updatePages = function (dataLength, perPage) {
    //this function is responsible for
    //updating the pageCount variable
    //based on the data length
    let totalPgs = parseInt(dataLength / perPage);
    if (dataLength % perPage !== 0) totalPgs += 1;
    return totalPgs;
}

Template.cardGallery.events({
  'click .navigate-to-gallery-page': function(e, template) {
    let newPage = $(e.currentTarget).attr('data-page');
    template.currentPage.set(Number(newPage));
  }
})

Template.cardGallery.helpers({
  galleryFilters() {
    return this.galleryFilters;
  },
  minusOne(num) {
    return num--;
  },
  plusOne(num) {
    return num++;
  },
  currentPage() {
    // HACK maybe - set to 1 if we're swapping contexts
    // in which the prior context had more pages
    // we can't access .closes-editor, since it exists outside
    // the scope of the cardGallery template
    let current = Template.instance().currentPage.get();
    let total = Template.instance().pageCount.get();
    if (current > total) {
      Template.instance().currentPage.set(1);
    }
    return Template.instance().currentPage.get();
  },
  pageCount() {
    return Template.instance().pageCount.get();
  },
  galleryPage() {
    let template = Template.instance();

    let pageNumber = template.currentPage.get();
    let itemsPerPage = template.perPage.get();

    let from = (pageNumber -1) * itemsPerPage;
    let to = from + itemsPerPage;

    let data = template.data.galleryContext;

    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;

      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;

      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }

    let dataLength = data.length,
    perPage = template.perPage.get();
    template.pageCount.set(updatePages(dataLength, perPage));

    return baseSlice(data, from, to);
  },
  canGoBackTo() {
    if (Template.instance().currentPage.get() !== 1) {
      return Template.instance().currentPage.get() - 1;
    }
    return false;
  },
  canGoForwardTo() {
    if (Template.instance().currentPage.get() < Template.instance().pageCount.get()) {
      return Template.instance().currentPage.get() + 1;
    }
    return false;
  }
})

Template.scenebuilderBuild__metaEditor.onCreated(function() {
  var self = Template.instance();

  self.settingTurn = new ReactiveVar(false);
})

Template.scenebuilderBuild__metaEditor.onRendered(function() {
  var template = Template.instance();

  var meta__turn = document.getElementById('meta__turn');
  var metaTurnStart = function() {
    var turnState = Scenes.findOne().meta.turnState;
    if (turnState.player === 1) {
      return (turnState.turn * 2) - 1;
    } else {
      return (turnState.turn * 2)
    }
  }();

  noUiSlider.create(meta__turn, {
    start: [metaTurnStart],
    margin: 1,
    step: 1,
    range: {
      'min': 1,
      'max': 15
    }
  });

  meta__turn.noUiSlider.on('start', function() {
    template.settingTurn.set(calculateTurn(meta__turn.noUiSlider.get()))
  })
  meta__turn.noUiSlider.on('update', function() {
    template.settingTurn.set(calculateTurn(meta__turn.noUiSlider.get()))
  })
  meta__turn.noUiSlider.on('change', function() {
    template.settingTurn.set(false)
    var turnState = {
      scene: FlowRouter.getParam('hash'),
      turnState: calculateTurn(meta__turn.noUiSlider.get())
    }
    Meteor.call('metaEditor__turn', turnState, function(err,data) {
      if (err) { sAlert.error(err.reason); }
    })
  })

  template.settingTurn.set(false)

  function calculateTurn(turn) {
    var player = turn % 2 === 1 ? 1 : 2;
    turn = Math.ceil(turn/2);
    return {player:player, turn:turn};
  }
})

Template.scenebuilderBuild__metaEditor.events({
  'keyup #meta-editor__player-mana--1': function(e, template) {
    var mana = Number(document.querySelector('#meta-editor__player-mana--1').value);
    if (mana > 9) {
      mana = 9;
      document.querySelector('#meta-editor__player-mana--1').value = 9;
      sAlert.error('Can only have 9 mana');
    }

    Meteor.call('editor__manaAvailable', {
      scene: FlowRouter.getParam('hash'),
      owner: 1,
      mana: mana
    }, function(err, data) {
      if (err) {
        sAlert.error(err.reason);
      }
    })
  },
  'keyup #meta-editor__player-mana--2': function(e, template) {
    var mana = Number(document.querySelector('#meta-editor__player-mana--2').value);
    if (mana > 9) {
      mana = 9;
      document.querySelector('#meta-editor__player-mana--2').value = 9;
      sAlert.error('Can only have 9 mana');
    }

    Meteor.call('editor__manaAvailable', {
      scene: FlowRouter.getParam('hash'),
      owner: 2,
      mana: mana
    }, function(err, data) {
      if (err) {
        sAlert.error(err.reason);
      }
    })
  }
})

Template.scenebuilderBuild__metaEditor.helpers({
  settingTurn() {
    if (Template.instance().settingTurn.get()) {
      var set = Template.instance().settingTurn.get();
      if (set.turn === 7 && set.player === 2) {
        set.turn = '7+'
      }
      if (set.turn === 8 && set.player === 1) {
        set.turn = '8+'
      }
      return set;
    }
    return false;
  },
  metaTurn() {
    return Scenes.findOne().meta.turnState;
  }
})

Template.scenebuilderBuild__share.onCreated(function() {
  let self = Template.instance();

  self.shareLinks = new ReactiveVar(null);
})

Template.scenebuilderBuild__share.events({
  'click [name="scenebuilder-link-type"]': function(e, template) {
    var type = document.querySelector('input[name="scenebuilder-link-type"]:checked').value;
    if (type === 'edit') {
      var link = location.protocol + '//' + location.host + '/scene/build/' + FlowRouter.getParam('hash');
      return template.shareLinks.set([link])
    }

    if (type === 'overview') {
      var link = location.protocol + '//' + location.host + '/scene/' + Scenes.findOne().viewId;
      return template.shareLinks.set([link])
    }

    if (type === '1' || type === '2') {
      var link = location.protocol + '//' + location.host + '/scene/' + Scenes.findOne().viewId + '?player=' + type;
      return template.shareLinks.set([link])
    }

    if (type === 'imgur') {
      sAlert.info('Beginning upload - hang tight!');
      template.shareLinks.set(['Uploading...','Uploading...']);
      var url = location.protocol + '//' + location.host + '/scene/' + FlowRouter.getParam('hash');
      Meteor.call('exportScene', url, function(err, data) {
        if (err) {
          sAlert.error(err.reason);
          template.shareLinks.set(null);
        } else {
          sAlert.success('Finished uploading!');
          return template.shareLinks.set(data);
        }
      })
    }
  }
})

Template.scenebuilderBuild__share.helpers({
  shareLinks() {
    return Template.instance().shareLinks.get();
  }
})
