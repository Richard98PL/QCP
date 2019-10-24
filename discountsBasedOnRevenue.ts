export function onAfterCalculate(quote, lines, conn) {
    //must be onAfter if you edit net price!
        if(lines.length){
            return showAllOppsWithoutCurrent(quote,lines,conn);
        }else{
	    return Promise.resolve();
	}
}	

function showAllOppsWithoutCurrent(quote,lines,conn){
	let accountId = getQuoteAccountId(quote);
	let currentOppId = getCurrentOppId(quote);
	if(accountId){
	let queryString = getOpportunitiesQueryString(accountId);  
		// u can't get oppName like that... just Id.. idk why
		return conn.query(queryString)
			.then(function(results) {                       
				if (results.totalSize) {
					let Opps = results.records[0].Opportunities.records;
					//weird but it is SOQL IN SOQL so we have records,totalSize and done TWICE :) So Opp is object, opp.records is array!
					let linesToSend = "";
					let sumRevenue = 0;
					Opps.forEach(function(opp){
						if(opp["Id"] != currentOppId){
							let expectedRevenue = opp["ExpectedRevenue"] || 0;
							linesToSend += "\\n" + opp["Name"] + "\\n" + "Expected Revenue : " + expectedRevenue + "\\n";
							sumRevenue += opp["ExpectedRevenue"];
						}
					});
					linesToSend += "\\n" + "Summary Revenue = " + sumRevenue.toFixed(2) + "\\n";
					// must be fixed(2) to have correct money value
					let revenueDiscount = chooseDiscount(sumRevenue);
					linesToSend += "Revenue Discount = " + (revenueDiscount*100)+"%";
					quote.record["Opp_List__c"] = linesToSend;  
					doRevenueDiscounts(lines,revenueDiscount)    
			}
		});
	}else{
		quote.record["Opp_List__c"] = 'Quote has no Account associated.';
		return Promise.resolve();
	}
}

function doRevenueDiscounts(lines,revenueDiscount){ 
    if (lines.length) {
        lines.forEach(function (line) {  
			let isPoT = line.PricingMethod__c == "Percent Of Total" ? true : false;
			if(!isPoT) { 
				line.record["SBQQ__NetPrice__c"] *= (1 - revenueDiscount);
			}
		}); 	      
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

function getCurrentOppId(quote){
	let opp = quote.record["SBQQ__Opportunity__r"];
	let result;

	if(opp){
		result = quote.record["SBQQ__Opportunity__r"]["Id"];
	}
	return result;
}

function getOpportunitiesQueryString(accountId){
	return "SELECT Id, Name, (SELECT Id, Name, ExpectedRevenue FROM Opportunities) FROM Account WHERE Id = " + "'" + accountId + "'";
}

function chooseDiscount(sumRevenue){
	if(sumRevenue < 100){
		return -0.1;
	}else if (sumRevenue > 400){
		return 0.2;
	}else return 0;
}

/*
IMPORTANT!!!! IN FORMULA HOLDER FOR TEXT AREA FIELD GIVE THIS FORMULA ->>>> SUBSTITUTE(Opp_List__c, ' \n', BR())
because we send ' \\n ' which is read as ' \n ' and formula doesn't understand it.. it only understand BR()

in order to this function work properly create field 'Opp_List__C' Text Area(255) at quote object and
	Opp_List_Holder__c Formula(Text) at quote object also -> then add then second one to the quote field set
*/
