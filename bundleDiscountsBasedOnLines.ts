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
        let isChildrenOfDiscountableBundle = parentsOfG3CWithChildrenQuantities.has(lineParent);

        if(isChildrenOfDiscountableBundle){
            let discount = getAppropriateDiscount(parentsOfG3CWithChildrenQuantities.get(lineParent));
            line.record["SBQQ__NetPrice__c"] *= 1-discount; 
        }
   });
}

  function getG3CParentsWithItsChildrenQuantities(lines){
    let G3CNamesSet = new Set( ["GIS City","GIS Country","GIS Custom"] );
    let parentsOfG3CWithItsChildrenQuantities = new Map();
    
     lines.forEach(function(line){
         let lineParent = line.parentItem;
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
    });
  
     return parentsOfG3CWithItsChildrenQuantities;
  }

  function getAppropriateDiscount(quantityOfG3CLines){
      let tier = getTier(quantityOfG3CLines);
      switch(tier){
          case "Tier 1": return 0.15;
          case "Tier 2": return 0.40;
          case "Tier 3": return 0.50;
          case "Tier 4": return 0.60;
          case "Tier 5": return 0.70;
          case "Tier 6": return 0.75;
          case "Tier 7": return 0.78;
          default: return 0;
      }
  }

  function getTier(quantityOfG3CLines){
      
    const tier = {

        tiersArray : new Array(
          {TierLowerBound : 2,
          TierUpperBound : 5,
          TierName : 'Tier 1'},

          {TierLowerBound : 6,
          TierUpperBound : 10,
          TierName : 'Tier 2'},

          {TierLowerBound : 11,
          TierUpperBound : 15,
          TierName : 'Tier 3'},

          {TierLowerBound : 16,
          TierUpperBound : 20,
          TierName : 'Tier 4'},

          {TierLowerBound : 21,
          TierUpperBound : 30,
          TierName : 'Tier 5'},

          {TierLowerBound : 31,
          TierUpperBound : 40,
          TierName : 'Tier 6'},

          {TierLowerBound : 41,
          TierUpperBound : 55,
          TierName : 'Tier 7'},
        ),       
        checkWhichTier : function(number){
          for(let i = 0 ; i < tier.tiersArray.length ; i++){
           if(tier.isBetween(number, tier.tiersArray[i].TierLowerBound, tier.tiersArray[i].TierUpperBound)){
              return tier.tiersArray[i].TierName;
           }
          }    
        },     
        isBetween : function(number,lowerBound,upperBound){
          if(number >= lowerBound && number <= upperBound){
              return true;
          }else return false;
    }
  }
 
    return tier.checkWhichTier(quantityOfG3CLines);
  }


  
  
