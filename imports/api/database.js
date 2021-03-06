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

Meteor.publish('someCards', function(filters) {
  check(filters, Object);

  return allCards.find(filters);
})

Meteor.publish( 'cardHistory', function(cardId) {
  check(cardId, Number);
  return historicalCards.find({id: cardId})
})

Meteor.publish( 'cardPage', function(cardId) {
  check(cardId, Array);
  return allCards.find({id: {$in: cardId}})
})

Meteor.publish( 'cardMeta', function(cardId) {
  check (cardId, Number);

  return cardMeta.find({id: cardId});
})

Meteor.publish( 'factionCards', function(faction) {
  check(faction, String);
  return allCards.find({faction: new RegExp( faction, 'gi')});
})

Meteor.publish( 'patchCards', function(patch) {
  check(patch, Number);
  return historicalCards.find({patch: patch});
})

Meteor.publish( 'patchChanges', function(patch) {
  check(patch, Number);

  var cards = historicalCards.find({patch: patch}).fetch().reduce(function(a, b) {
    a.push(b.id);
    return a;
  }, [])

  ReactiveAggregate(this, historicalCards, [
    {$match: {id: {$in: cards}}},
    {
      $group: {
        _id: "$id",
        patches: { $push: "$$ROOT" }
      }
    }
  ], { clientCollection: 'patch_changes' })
})
