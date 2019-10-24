export function onBeforeCalculate(quote, lines, conn) {
    //third argument is connection to our org??
        if(lines){
            return showAllOpps(quote,lines,conn);
        }else{
	    return Promise.resolve();
	}
}	

function showAllOpps(quote,lines,conn){
	let accountId = getQuoteAccountId(quote);
	if(accountId){
		let queryString = getOpportunitiesQueryString(accountId);  
		return conn.query(queryString)
			.then(function(results) {                       
				if (results.totalSize) {
					let Opps = results.records[0].Opportunities.records;
					//weird but it is SOQL IN SOQL so we have records,totalSize and done TWICE :) So Opp is object, opp.records is array!
					let linesToSend = '';
					Opps.forEach(function(opp){
						linesToSend += opp["Name"] + "\\n";
					});
					quote.record['Opp_List__c'] = linesToSend;     
					console.log(linesToSend);         
			}
		});
	}else{
		quote.record["Opp_List__c"] = 'Quote has no Account associated.';
		return Promise.resolve();
	}
}

function getQuoteAccountId(quote){
	let account = quote.record["SBQQ__Account__r"];
	let result;

	if(account){
		result = quote.record["SBQQ__Account__r"]["Id"];
	}
	return result;
}

function getOpportunitiesQueryString(accountId){
	return "SELECT Id, Name, (SELECT Id, Name FROM Opportunities) FROM Account WHERE Id = " + "'" + accountId + "'";
}

/*
IMPORTANT!!!! IN FORMULA HOLDER FOR TEXT AREA FIELD GIVE THIS FORMULA ->>>> SUBSTITUTE(Opp_List__c, ' \n', BR())
because we send ' \\n ' which is read as ' \n ' and formula doesn't understand it.. it only understand BR()

in order to this function work properly create field 'Opp_List__C' Text Area(255) at quote object and
	Opp_List_Holder__c Formula(Text) at quote object also -> then add then second one to the quote field set
*/
