 function getTierDiscount(quantityOfG3CLines){
      
    const tier = {

        tiersArray : new Array(
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
          TierUpperBound : 55,
          TierName : 'Tier 7',
          TierDiscount : 0.78},
        ),       
        checkWhichTier : function(number){
          for(let i = 0 ; i < tier.tiersArray.length ; i++){
           if(tier.isBetween(number, tier.tiersArray[i].TierLowerBound, tier.tiersArray[i].TierUpperBound)){
              return tier.tiersArray[i].TierDiscount;
           }
          }    
        },     
        isBetween : function(number,lowerBound,upperBound){
          if(number >= lowerBound && number <= upperBound){
              return true;
          }else return false;
    }
  }
 
    return tier.checkWhichTier(quantityOfG3CLines) || 0;
  }
