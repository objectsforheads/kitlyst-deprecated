Meteor.methods({
'updateCards': function(pass) {
  check(pass, String);

  if (pass === 'mEFFg6COePONIoqYx6CY') {
    allCards.remove({});
    var apiKey = 'cf156a2e4b5296b5a184e53ab14dd99f';
    HTTP.get('http://listlyst.com/api/v1/cards?apikey=' + apiKey, {}, function(err, res) {
      if (err) {
        return false;
      }
      else {
        var cards = res.data;
        cards.forEach(function(card) {
          allCards.insert(card);
        })
        return true;
      }
    })

    historicalCards.remove({});
    var patches = [
      0.01,0.02,0.03,0.04,0.05,0.06,0.08,0.09,
      0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,
      0.2,0.21,0.22,0.23,0.24,0.25,0.26,0.27,0.28,0.29,
      0.3,0.31,0.32,0.33,
      0.42,0.44,0.49,
      0.51,0.53,0.55,0.57,0.59,
      0.6,0.61,0.62,1.63,1.64,1.65,1.66,1.67,1.69,
      1.71,1.73,1.74,1.75,1.76,1.77
    ]

    patches.forEach(function(patch) {
      HTTP.get('http://listlyst.com/api/v1/patch/' + patch + '/cards?apikey=' +  apiKey, {}, function(err, res) {
        if (err) {
          return false;
        }
        else {
          var cards = res.data.cards;
          cards.forEach(function(card) {
            historicalCards.insert(card);
          })
          return true;
        }
      })
    })
  }
  return false;
},
'updateMeta': function(info) {
  check(info, {
    updateMeta_password: String,
    updateMeta_meta: Array
  })

  if (info.updateMeta_password === 'mEFFg6COePONIoqYx6CY') {
    var metas = info.updateMeta_meta;

    metas.forEach(function(meta) {
      var add = {
        id: meta.id,
        sprites: meta.groups,
        association: meta.id
      }
      if (cardMeta.find({id: meta.id}).count() === 0) {
        cardMeta.insert(add)
      } else {
        var id = cardMeta.findOne({id: meta.id})._id;
        cardMeta.update({_id: id}, add)
      }
    })
  }
}
})
