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
  }
  return false;
}
})
