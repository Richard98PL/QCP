export function onAfterCalculate(quote, lines) {

  setDiscountInEachBundleBasedOnNumberOfServices(lines);          

 return Promise.resolve();
};

function setDiscountInEachBundleBasedOnNumberOfServices(lines){
 
  let useCaseBundlesMap = new Map(); //* key -> Use Case Bundle
                                    //* value -> quantity of services

  let hereFuelServicesMap = new Map(); //*key -> hereFuelService
                                    //* value -> true/false if contains onlyAmerica

  lines.forEach(function(line){
    if(line.record["SBQQ__Product__r"]["Family"] == "Use Case"){
      useCaseBundlesMap.set(line, 0); //* initializing with zero for each bundle
    }else if(line.record["SBQQ__ProductName__c"] == "Service C (HERE Fuel)"){
      hereFuelServicesMap.set(line,true);
    }
  });

  //carefully! two actions in one loop, to gain more performance
  lines.forEach(function(line){
    //counting services in each useCaseBundle FUELSERVICES WITH ONLYAMERICA ALSO, BUT LATER WE WILL WORK ON THAT
    for (let [k, v] of useCaseBundlesMap) {
     if(line.record["SBQQ__Product__r"]["Family"] == "Service" && line.parentItem == k){
       useCaseBundlesMap.set(k,++v);
     }
    }
    //setting false in hereFuelServicesMap if HERE Fuel DOESN NOT contains only America
    if(line.record["SBQQ__Product__r"]["Family"] == "Coverage Area" && line.record["SBQQ__ProductName__c"] != "America"){
      hereFuelServicesMap.set(line.parentItem,false);
    }
  });

  //we counted every Service, now we have to remove fuelServices with America only
  for (let [caseKey, caseValue] of useCaseBundlesMap) {
    for (let [fuelKey, fuelValue] of hereFuelServicesMap) {
        if(fuelKey.parentItem == caseKey && fuelValue == true){
          useCaseBundlesMap.set(caseKey,--caseValue);
        }
    }
  }
  console.table(Array.from(useCaseBundlesMap.values())); //will display values of services(without onlyAmerica fuel service) for each Use Case Bundle
  setDiscountsOnCoverageAreas(lines,useCaseBundlesMap);
}

function setDiscountsOnCoverageAreas(lines,useCaseBundlesMap){
  let servicesQuantity = 0;
  lines.forEach(function(line){
    if(line.record["SBQQ__Product__r"]["Family"] == "Coverage Area"){
      servicesQuantity = useCaseBundlesMap.get(line.parentItem.parentItem);
      switch(servicesQuantity){
        case 0: break;
        case 1: line.record["SBQQ__NetPrice__c"] *= 0.85; break;
        case 2: line.record["SBQQ__NetPrice__c"] *= 0.80; break;
        case 3: line.record["SBQQ__NetPrice__c"] *= 0.75; break;
        case 4: line.record["SBQQ__NetPrice__c"] *= 0.70; break;
        case 5: line.record["SBQQ__NetPrice__c"] *= 0.65; break;
        default : line.record["SBQQ__NetPrice__c"] *= 0.55;
      }
    }
  });
}
