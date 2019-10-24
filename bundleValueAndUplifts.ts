export function onInit(quoteLineModels) {
      /* very important don't delete */
      markBundleParents(quoteLineModels);
      /* _________________ */
    return Promise.resolve();
};

export function onBeforeCalculate(quoteModel, quoteLineModels)
    return Promise.resolve();
};

export function onAfterCalculate(quoteModel, quoteLineModels) {
    //uplifts for eachBundle
    let bundleParents = findBundleParents(quoteLineModels);
    bundleParents.forEach(function(bundleParent){
        let children = findChildren(quoteLineModels,bundleParent);
        doTheUpliftDiscountsToTheBundle(children,bundleParent);
    })
    //uplifts
    fillBundleLevelValues(quoteLineModels);
    return Promise.resolve();
};

function findBundleParents(quoteLineModels){
    let bundleParents = [];
    if (quoteLineModels !== null) {
        quoteLineModels.forEach(function (line) {
            if(line.record["isParent__c"]) {
                    bundleParents.push(line);
            }
        });
    }
    return bundleParents;
}
//PoT wyklucz
function markBundleParents(quoteLineModels){
    let bundleParents = new Set();
    if (quoteLineModels !== null) {
        quoteLineModels.forEach(function (line) {
            let parent = line.parentItem;
            if (parent !== null) {
                 bundleParents.add(parent);
            }
        });
    }
        let arrayFromSet = [];
        bundleParents.forEach(function(result){
            arrayFromSet.push(result);
            }
        )
        arrayFromSet.forEach(function(parent){
            parent.record["isParent__c"] = true;  
        });
}

function findChildren(quoteLineModels,parentOfFamily){
    let children = [];
    if (quoteLineModels !== null) {
        quoteLineModels.forEach(function (line) {
            let parent = line.parentItem;
            if(parent === parentOfFamily){
                children.push(line);
            }
        });
    }
    return children;
}

function fillBundleLevelValues(quoteLineModels){
    if (quoteLineModels != null) {
        quoteLineModels.forEach(function (line) {
            //neccessary to don't overadd
            line.record["Bundle_Level_Value__c"] = 0;
            //idk why was on init - useless, waste     
            var parent = line.parentItem;
            if (parent != null) {
                //nonsense, why spam so many values in here?
                //what if we want to reuse the function? just send the line to getTotal
                //like really instead in 3 methods having 'line' they spam 9 values 3 times = 27 spam values
                var pComponentCustomTotal = parent.record["Bundle_Level_Value__c"] || 0;
                var cTotalPrice = getTotalPrice(line);
                pComponentCustomTotal += cTotalPrice;
                parent.record["Bundle_Level_Value__c"] = pComponentCustomTotal;              
            }
        });
    }
}

function doTheUpliftDiscountsToTheBundle(bundleLines,parent){ 
    let upliftDiscount = 0;
    if (bundleLines !== null) {
        bundleLines.forEach(function (line) {
                let productName = line.record["SBQQ__ProductName__c"];
                if(productName.includes('Uplift')){
                    let upliftNumber = productName[productName.length - 1];
                    /* -> CALCULATING UPLIFT QUANTITY, BUT IT TURNED OUT THAT IT'S ALWAYS 1....
                    console.table( 
                        [{Name: 'Uplift '+ upliftNumber, Quantity: line.Quantity__c}]
                    )
                    //getting effective Quantity, not neccessary for Uplifts but just to train
                    let realQuantity = getEffectiveQuantity(line);
                    */
                    // my code
                    //upliftDiscount += (upliftNumber * 10) * line.Quantity__c;
                    let realQuantity = 1;
                    upliftDiscount += (upliftNumber * 10) * realQuantity;             
                }
        });
    }
    if(parent){
        parent.record["SBQQ__NetPrice__c"] *= (1 - (upliftDiscount/100));
        let children = findChildren(bundleLines,parent);
            children.forEach(function(child) {
                //avoiding the discount on PoT's 
                let isPoT = child.PricingMethod__c == 'Percent Of Total' ? true : false;
                if(!child.record["SBQQ__ProductName__c"].includes('Uplift') && !isPoT){
                    child.record["SBQQ__NetPrice__c"] *= (1 - (upliftDiscount/100));
                    // I don't why doesn't affect many times? I mean I should use Original Price to avoid looping
                    // but it still works when I don't and use it like a newbie
                    // Even at Cert questions I saw that usage example
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
    var delta = quantity - priorQuantity;

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
 * not using global variables or session storage
 * not using additional discount
 * 
 * cons:
 * need to make custom field isParent__c on ql object
 *
 *ps: create Bundle_Level_Value__c on quote line
 */
