export function onAfterCalculate(quote, lines) {

  setDiscountOnServices(
                       lines,
                       calculateServicesQuantity(quote,lines)
                       );

 return Promise.resolve();
};

function calculateServicesQuantity(quote,lines){
   let servicesQuantity = 0;
   let doubleBundle3LinesSet = new Set();

   lines.forEach(function(line){
       let lineParent = line.parentItem;
       if(line.record["SBQQ__Product__r"]["Family"] == "Service"){
           if(lineParent.record["SBQQ__ProductName__c"] == "Double Bundle 3 (other than America criteria)"){
             doubleBundle3LinesSet.add(line.record["SBQQ__ProductName__c"]);
       }else{
           servicesQuantity++;
       }
   }
     });

   let isOnlyAmericaSelected = doubleBundle3LinesSet.size == 1 && 
                               doubleBundle3LinesSet.has("America");

   if(!isOnlyAmericaSelected){
     servicesQuantity += doubleBundle3LinesSet.size;
   }

   return servicesQuantity;
}

function setDiscountOnServices(lines,servicesQuantity){
 let discount = 0;

 switch(servicesQuantity){
   case 1: discount = 0.13; break;
   case 2: discount = 0.15; break;
   case 3: discount = 0.17; break;
   case 4: discount = 0.19; break;
   case 5: discount = 0.2; break;
 }
 
 lines.forEach(function(line){
   if(line.record["SBQQ__Product__r"]["Family"] == "Service"){
     line.record["SBQQ__NetPrice__c"] -= discount * line.record["SBQQ__NetPrice__c"];
   }    
 });
}
