//HEY!
//G3C -> G C C C -> GIS CITY / COUNTRY / CUSTOM


export function onAfterCalculate(quote, lines) {
  setG3CDiscounts(lines);
  return Promise.resolve();
};

function setG3CDiscounts(lines){
  let parentsOfG3CWithChildrenQuantities = getG3CParentsWithItsChildrenQuantities(lines);

  lines.forEach(function(line){
      let lineParent = line.parentItem;
      if(line.parentItem != null){
        let isChildrenOfDiscountableBundle = parentsOfG3CWithChildrenQuantities.has(lineParent);

        if(isChildrenOfDiscountableBundle){
            let discount = getTierDiscount(parentsOfG3CWithChildrenQuantities.get(lineParent));
            line.record["SBQQ__NetPrice__c"] *= 1-discount; 
        }
      }
 });
}

function getG3CParentsWithItsChildrenQuantities(lines){
  let G3CNamesSet = new Set( ["GIS City","GIS Country","GIS Custom"] );
  let parentsOfG3CWithItsChildrenQuantities = new Map();
  
   lines.forEach(function(line){
       let lineParent = line.parentItem;
        if(line.parentItem != null){
        let isLineG3C = G3CNamesSet.has(line.record["SBQQ__Product__r"]["Family"]);

        if(isLineG3C){

            if(!parentsOfG3CWithItsChildrenQuantities.has(lineParent)){
                parentsOfG3CWithItsChildrenQuantities.set(lineParent,1);
            }
            
            else{
                parentsOfG3CWithItsChildrenQuantities.set(
                    lineParent,
                    parentsOfG3CWithItsChildrenQuantities.get(lineParent) + 1 //incrementing by one
                );
            }   
        }
      }
    });

   return parentsOfG3CWithItsChildrenQuantities;
}

function getTierDiscount(quantityOfG3CLines){
    
  const tier = {

      tiersArray : [
        {TierLowerBound : 2,
        TierUpperBound : 5,
        TierName : 'Tier 1',
        TierDiscount : 0.15},

        {TierLowerBound : 6,
        TierUpperBound : 10,
        TierName : 'Tier 2',
        TierDiscount : 0.40},

        {TierLowerBound : 11,
        TierUpperBound : 15,
        TierName : 'Tier 3',
        TierDiscount : 0.50},

        {TierLowerBound : 16,
        TierUpperBound : 20,
        TierName : 'Tier 4',
        TierDiscount : 0.60},

        {TierLowerBound : 21,
        TierUpperBound : 30,
        TierName : 'Tier 5',
        TierDiscount : 0.70},

        {TierLowerBound : 31,
        TierUpperBound : 40,
        TierName : 'Tier 6',
        TierDiscount : 0.75},

        {TierLowerBound : 41,
        TierUpperBound : 'noLimit',
        TierName : 'Tier 7',
        TierDiscount : 0.78},
        ],       
        getDiscount : function(number){
          let foundTier =  tier.tiersArray.filter(function(object){
            let isBetween = number >= object.TierLowerBound && ( number <= object.TierUpperBound || object.TierUpperBound  == 'noLimit')  
            return isBetween;
          }).values().next().value;
          
          return foundTier ? foundTier.TierDiscount : 0;
        }             
    }
  return tier.getDiscount(quantityOfG3CLines);
}




