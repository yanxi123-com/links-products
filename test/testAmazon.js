var config = require('../config').config;
var util = require('util');
var OperationHelper = require('apac').OperationHelper;

var opHelper = new OperationHelper(config.amazonOption);

// http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemLookup.html
opHelper.execute('ItemLookup', {
    'ItemId' : 'B00EENU8T2',
    'ResponseGroup' : 'ItemAttributes,Offers'
}, function(results) {
    var item = results.ItemLookupResponse.Items[0].Item[0];
    console.log(item.Offers[0].Offer[0].OfferListing[0].AvailabilityAttributes);
    console.log(item.OfferSummary[0]);
    console.log(item.OfferSummary[0].LowestNewPrice);
    console.log(item.ItemAttributes);
});