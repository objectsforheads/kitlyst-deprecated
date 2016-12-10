import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route( '/', {
  name: 'homepage',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'homepage' } );
  }
});

FlowRouter.route( '/account', {
  name: 'account',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'userAccount' } );
  }
});

var deckBuild = FlowRouter.group({
  prefix: '/deck/build'
})

var deckView = FlowRouter.group({
  prefix: '/deck/view'
})

deckBuild.route('/', {
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'deckBuildWrapper' } );
  },
  triggersEnter: function() {
    // Clear all Session variables
    Object.keys(Session.keys).forEach(function(key){ Session.set(key, undefined); })
    Session.keys = {}
  }
})
deckBuild.route('/:hash', {
  action: function(params) {
    BlazeLayout.render( 'mainLayout', { main: 'deckBuildWrapper' } );
  },
  triggersEnter: function() {
    // Clear all Session variables
    Object.keys(Session.keys).forEach(function(key){ Session.set(key, undefined); })
    Session.keys = {}
  }
})

deckView.route('/:hash', {
  action: function(params) {
    BlazeLayout.render( 'mainLayout', { main: 'deckView' } );
  },
  triggersEnter: function() {
    // Clear all Session variables
    Object.keys(Session.keys).forEach(function(key){ Session.set(key, undefined); })
    Session.keys = {}
  }
})

FlowRouter.route( '/secret-passage', {
  name: 'admin',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'adminMain' } );
  }
});

FlowRouter.route( '/devlog', {
  name: 'devlog',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'devlogMain' } );
  }
});

FlowRouter.route( '/database', {
  name: 'database',
  action: function() {
    BlazeLayout.render( 'mainLayout', { main: 'database' } );
  }
});

FlowRouter.route( '/database/card/:slug', {
  name: 'database',
  action: function(params) {
    BlazeLayout.render( 'mainLayout', { main: 'databaseCardPage' } );
  }
});
