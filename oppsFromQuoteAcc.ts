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
    let queryString = getOpportunitiesQueryString(accountId);  
	return conn.query(queryString)
		.then(function(results) {                       
			if (results.totalSize) {
				let Opps = results.records[0].Opportunities.records;
				//weird but it is SOQL IN SOQL so we have records,totalSize and done TWICE :) So Opp is object, opp.records is array!
				let linesToSend = '';
				Opps.forEach(function(opp){
					linesToSend += opp["Name"] + '\\n';
				});
				quote.record['Opp_List__c'] = linesToSend;     
				console.log(linesToSend);         
		}
	});
}

function getQuoteAccountId(quote){
	return quote.record["SBQQ__Account__r"]["Id"];
}

function getOpportunitiesQueryString(accountId){
	return "SELECT Id, Name, (SELECT Id, Name FROM Opportunities) FROM Account WHERE Id = " + "'" + accountId + "'";
}
