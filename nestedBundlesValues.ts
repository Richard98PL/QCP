export function onInit(lines) {
    /* very important don't delete */
    lines.forEach(function(line){
        line.record["Bundle_Level_Value__c"] = 0;
    });
	/* _________________ */
  return Promise.resolve();
};

export function onAfterCalculate(quote, lines) {
    fillBundlesLevelTotal(lines);
  return Promise.resolve();
};

function fillBundlesLevelTotal(lines){

  if(lines.length){
    lines.forEach(function(line){
      //first set starting bundle value
      if(line.record["SBQQ__Bundle__c"]){
        line.record["Bundle_Level_Value__c"] += line.record["SBQQ__NetPrice__c"];
      }
    });
  }
  
  lines.sort((a,b) => (a.record["SBQQ__OptionLevel__c"] < b.record["SBQQ__OptionLevel__c"] ? 1: -1));
  if (lines.length) {
        lines.forEach(function(line){
          if(line.parentItem != null){
            let lineParent = line.parentItem;
            let lineTotalPrice = getTotalPrice(line);
            if(line.record["Bundle_Level_Value__c"] == 0){
              lineParent.record["Bundle_Level_Value__c"] += lineTotalPrice;
            }
            else{
                lineParent.record["Bundle_Level_Value__c"] += line.record["Bundle_Level_Value__c"]; 
              }
            }
            
        });
      }

}

function getTotalPrice(line) {
  /*
  Short-circuit evaluation, minimal evaluation, or McCarthy evaluation (after John McCarthy) is the semantics of some Boolean operators in some programming languages in which the second argument is executed or evaluated only if the first argument does not suffice to determine the value of the expression
  */
  let netPrice = line.record["SBQQ__NetPrice__c"] || 0; 
  let priorQuantity = line.PriorQuantity__c || 0;
  let renewal = line.Renewal__c || false;
  let existing = line.Existing__c || false;
  if ((renewal === true) && (existing === false) && (priorQuantity == null)) {
	  // Personal note: In onAfterCalculate, we specifically make sure that priorQuantity can't be null.
	  // So isn't this loop pointless?
	  return 0;
  } else {
	  return netPrice * getEffectiveQuantity(line);
  }
}

function getEffectiveQuantity(line) {
  let listPrice = line.ProratedListPrice__c || 0;
  let quantity = line.Quantity__c == null ? 1 : line.Quantity__c;
  let priorQuantity = line.PriorQuantity__c || 0;
  let pricingMethod = line.PricingMethod__c == null ? "List" : line.PricingMethod__c;
  let discountScheduleType = line.DiscountScheduleType__c || '';
  let renewal = line.Renewal__c || false;
  let existing = line.Existing__c || false;
  let subscriptionPricing = line.SubscriptionPricing__c || '';
  let delta = quantity - priorQuantity;

  if (pricingMethod == 'Block' && delta == 0) {
	  return 0;
  } else if (pricingMethod == 'Block') {
	  return 1;
  } else if (discountScheduleType == 'Slab' && (delta == 0 || (quantity == 0 && renewal == true))) {
	  return 0;
  } else if (discountScheduleType == 'Slab') {
	  return 1;
  } else if (existing == true && subscriptionPricing == '' && delta < 0) {
	  return 0;
  } else if (existing == true && subscriptionPricing == 'Percent Of Total' && listPrice != 0 && delta >= 0) {
	  return quantity;
  } else if (existing == true) {
	  return delta;
  } else {
	  return quantity;
  }
}

/**
* pros and cons
* pros : 
* works.....
* not using global letiables or session storage
* not using additional discount
* 
* cons:
* need to make custom field isParent__c on ql object
*
*ps: create Bundle_Level_Value__c on quote line
*/
