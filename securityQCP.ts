export function onInit(lines) {
        setSecurityPicklistValuesForChildren(lines);
  return Promise.resolve();
};

export function onAfterCalculate(quote, lines) {
    
  return Promise.resolve();
};

export function isFieldEditableForObject(fieldName, line, conn, objectName){

    if (objectName === 'QuoteLine__c' && fieldName === 'securityPicklist__c') {
       if( !line.SBQQ__Bundle__c && line.SBQQ__ProductName__c.includes("Child Product wPicklist")){
           return false;
       }else{
            return true;
       }
   }
}

export function isFieldVisibleForObject(fieldName, line, conn, objectName){
    if (objectName === 'QuoteLine__c' && fieldName === 'securityPicklist__c') {
        if( line.SBQQ__Bundle__c && line.SBQQ__ProductName__c.includes("Parent Product invPicklist")){
            return false;
        }else{
             return true;
        }
    }
  }

function setSecurityPicklistValuesForChildren(lines){
    if(lines.length){
        lines.forEach(function(line){
            let lineParent = line.parentItem;
            if(lineParent !== null && lineParent.record["SBQQ__ProductName__c"] == "Parent Product wPicklist"){
                line.record["securityPicklist__c"] = lineParent.record["securityPicklist__c"];
            }
        });
      }
}

