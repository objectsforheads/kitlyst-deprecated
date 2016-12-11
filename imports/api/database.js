// Set the compound index for database searching
allCards._ensureIndex( { name: 1, race: 1, description: 1, faction: 1 } );

Meteor.publish( 'databaseResults', function( search ) {
  check( search, Match.OneOf( String, null, undefined ) );

  if (search !== null && typeof search !== 'undefined') {
    search = search.replace(/[-[\]{}()*+?.,\\=!<>^$|#]/g, "\\$&");
  }

  let query      = {},
      projection = { limit: 100, sort: { name: 1 } };

  if ( search ) {
    let regex = new RegExp( search, 'gi' );

    query = {
      $or: [
        { name: regex },
        { race: regex },
        { description: regex }
      ]
    };

    return allCards.find( query, projection );
  }
});

Meteor.publish( 'cardHistory', function(cardId) {
  check(cardId, Number);
  return historicalCards.find({id: cardId})
})

Meteor.publish( 'cardPage', function(cardId) {
  check(cardId, Number);
  return allCards.find({id: cardId})
})

Meteor.publish( 'cardMeta', function(cardId) {
  check (cardId, Number);

  return cardMeta.find({association: cardId});
})

Meteor.publish( 'factionCards', function(faction) {
  check(faction, String);
  return allCards.find({faction: new RegExp( faction, 'gi')});
})
