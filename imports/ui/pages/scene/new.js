import './new.html';
import './new.scss';

import '../database/components/card.js';

Template.scenebuilderNew.onCreated(function() {
  var self = Template.instance();

  // Indicate if player 1 or 2 is selecitng a general
  self.playerSelecting = new ReactiveVar(null);
  // Store the player's current general selection
  self.playerSelection = new ReactiveVar(null);
  // Transitional variable for general selection UI
  self.playerSelectionTemporary = new ReactiveVar(null);

  // Store the values to be sent to the scenebuilder
  self.sceneSetup = new ReactiveVar({
    player1: null,
    player2: null
  })

  self.subscribe('someCards', {race: 'General'}, () => {
    let generals = allCards.find().fetch();
    self.sceneSetup.set({
      player1: generals[Math.floor( Math.random() * generals.length )].id,
      player2: generals[Math.floor( Math.random() * generals.length )].id
    })
    // self.sceneSetup.player1 = generals.find().fetch( Math.floor( Math.random() * generals.length );
    // self.sceneSetup.player2 = generals.find().fetch( Math.floor( Math.random() * generals.length );
  })
})

Template.scenebuilderNew.helpers({
  generals() {
    return {
      left: allCards.find({id: {'$lt':300}}, {sort: {id: 1} }).fetch(),
      right: allCards.find({id: {'$gt':300}}, {sort: {id: 1}}).fetch()
    }
  },
  player1Selection() {
    return allCards.findOne({id: Template.instance().sceneSetup.get().player1});
  },
  player2Section() {
    return allCards.findOne({id: Template.instance().sceneSetup.get().player2});
  },
  playerSelecting() {
    return Template.instance().playerSelecting.get() || false;
  },
  playerSelectionTemporary() {
    var selection = Template.instance().playerSelectionTemporary.get();
    return allCards.findOne({id: Number(selection)});
  },
  generalSelected() {
    if (this.id === Number(Template.instance().playerSelectionTemporary.get())) {
      return true;
    }
    return false;
  },
})

Template.scenebuilderNew.events({
  'click .general-selector': (e) => {
    // Indicate that a player is selecting a general
    Template.instance().playerSelecting.set($(e.currentTarget).attr('data-player'));


    // Set the player's current general
    var id = Template.instance().sceneSetup.get()['player' + Template.instance().playerSelecting.get()];
    Template.instance().playerSelection.set(id);

    Template.instance().playerSelectionTemporary.set(id);

    // add sprite CSS if not yet added
    if ( $('head').find('link[href*="css/sprites/id/' + id + '\.min.css"]').length === 0 ) {
      $('head').append('<link href="/css/sprites/id/' + id + '.min.css" rel="stylesheet">')
    }
  },
  'click .general-selection__option': (e) => {
    var option = $(e.currentTarget).attr('data-change');

    if (option === 'modify') {
      // Update the selected generals
      var playerChanges = Template.instance().sceneSetup.get();
      playerChanges['player' + Template.instance().playerSelecting.get()] = Number(Template.instance().playerSelection.get());
      Template.instance().sceneSetup.set(playerChanges);
    }

    // Exit out of the selection screen
    Template.instance().playerSelecting.set(null);
    Template.instance().playerSelection.set(null);
    Template.instance().playerSelectionTemporary.set(null);
    return;
  },
  'mouseenter .screen__general-selection .general-hex': (e) => {
    var id = Number($(e.currentTarget).attr('data-general'))
    Template.instance().playerSelectionTemporary.set(id)

    // add sprite CSS if not yet added
    if ( $('head').find('link[href*="css/sprites/id/' + id + '\.min.css"]').length === 0 ) {
      $('head').append('<link href="/css/sprites/id/' + id + '.min.css" rel="stylesheet">')
    }
  },
  'mouseleave .screen__general-selection .general-hex': (e) => {
    Template.instance().playerSelectionTemporary.set(Template.instance().playerSelection.get())
  },
  'click .screen__general-selection .general-hex': (e) => {
    Template.instance().playerSelection.set($(e.currentTarget).attr('data-general'))
    Template.instance().playerSelectionTemporary.set($(e.currentTarget).attr('data-general'))
  }
})
