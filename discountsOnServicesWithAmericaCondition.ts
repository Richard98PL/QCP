export function onAfterCalculate(quote, lines) {

   setDiscountOnServices(
                        lines,
                        calculateServicesQuantity(quote,lines)
                        );

  return Promise.resolve();
};

function calculateServicesQuantity(quote,lines){
    let servicesQuantity = 0;
    let doubleBundle3LinesMap = new Map(); // key - name
                                           // value - quantity
                                           // map of lines in the america condition bundle

    lines.forEach(function(line){
        let lineParent = line.parentItem;
        if(line.record["SBQQ__Product__r"]["Family"] == "Service"){
            if(lineParent.record["SBQQ__ProductName__c"] == "Double Bundle 3 (other than America criteria)"){
              doubleBundle3LinesMap.set(
                        /*key*/         line.record["SBQQ__ProductName__c"], 
                        /*value*/       line.record["SBQQ__Quantity__c"]
                                        );
        }else{
            servicesQuantity += line.record["SBQQ__Quantity__c"];
        }
    }
      });

    let isOnlyAmericaSelected = doubleBundle3LinesMap.size == 1 && 
                                doubleBundle3LinesMap.has("America");

    if(!isOnlyAmericaSelected){
      for (let [k, v] of doubleBundle3LinesMap) {
        servicesQuantity += v;
      }
    }

    return servicesQuantity;
}

function setDiscountOnServices(lines,servicesQuantity){
  let discount = 0;

  if(servicesQuantity > 3){
    discount = 0.09;
  }else if(servicesQuantity > 5){
    discount = 0.13;
  }else if(servicesQuantity > 10){
    discount = 0.2;
  }
  
  lines.forEach(function(line){
    if(line.record["SBQQ__Product__r"]["Family"] == "Service"){
      line.record["SBQQ__NetPrice__c"] -= discount * line.record["SBQQ__NetPrice__c"];
    }    
  });
}
