function execute(){
	setTimeout(run,4000);
}
async function run(){
    let token=document.getElementById("auth-token").value ? document.getElementById("auth-token").value.toString(): "Default";
    this.bearer = "Bearer "+token;

    console.log(this.bearer);
    
    let list = await getList();

    for(i=0; i<list.centers.length;i++){
        if(parseInt(list.centers[i].sessions[0].available_capacity)>0)
            if(list.centers[i].sessions[0].min_age_limit=='18')
                if(list.centers[i].center_id=="396505"){
                    sessId=list.centers[i].sessions[0].session_id;
                    
                    console.log("Trying to schedule Appointment...");
                    res = await _scheduleAppointment(sessId, this.bearer);
                    console.log(res);
                    }
                }
	document.getElementById("response").innerHTML=res;
}

async function getList(){
	
	let token=document.getElementById("auth-token").value ? document.getElementById("auth-token").value.toString(): "Default";
    this.bearer = "Bearer "+token;
	
	var aDate=document.getElementById("appDate").value?document.getElementById("appDate").value:new Date();
	
	var dd = aDate.split(aDate.indexOf('-')<0?'/':'-')[2];
	var mm = aDate.split(aDate.indexOf('-')<0?'/':'-')[1];
	var yyyy = aDate.split(aDate.indexOf('-')<0?'/':'-')[0];
	

    this.appDate = dd + '-' + mm + '-' + yyyy;
	
    this.pin=document.getElementById("pin").value?document.getElementById("pin").value:"342005";
	
    let list = await _getList(this.appDate,this.pin,this.bearer);
	var htmlStr="";
	var j=1;
	for(i=0; i<list.centers.length;i++){
		var ageLimit=list.centers[i].sessions[0].min_age_limit=='18'?"18+":"45+";
		htmlStr+="<div class=\"list\"><h3>"+(j++)+'. '+list.centers[i].name+" - </h3>&nbsp;<h5 style='background: green; border-radius:25px;padding: 2px;'>"+ageLimit+"</h5><br><h2 style='text-align: center;'> - Slots: "+list.centers[i].sessions[0].available_capacity+"</h2></div>";
	
	}
	document.getElementById("response").innerHTML=htmlStr==""?"No Vaccination center found for date: "+this.appDate+"and pincode: "+this.pin:htmlStr;
}

async function _getList(appDate, pin, bearer){
    let url="https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode="+pin+"&date="+appDate;
    let response= await fetch(url,{
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',
        }
    });
    let data = await response.json();
    return data;

}

async function generateOtp(){
    let url="https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP";
	let mobile = document.getElementById("mobile").value;
	let reqdata='{"mobile": "'+mobile+'","secret":"U2FsdGVkX19/McGZM4NEQd5p2SWF6Y0xW3qN7nRTdVMFVEWX7p/TBUziMOxvFx/WBPyJm16JTvVGx3IK29kEsw=="}';
    let response= await fetch(url,{
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        },
		body: reqdata
    });
    let data = await response.json();
	this.txnId = data.txnId;
	var htmlres="<div class='input-group'><label><input type='number' id='otp' placeholder='Enter OTP'/><input type='hidden' id='txnId' value='"+this.txnId+"'/></label>&nbsp;<button class='unit' type='button' onclick='confirmOtp()'><span class='iconify' data-icon='ion:arrow-forward' data-inline='false'></span></button></div>";
	document.getElementById("validateOtp").innerHTML=htmlres;
    return data;

}
async function confirmOtp(){
    let url="https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp";
	let otp1 = document.getElementById("otp").value;
	let otp=sha256(otp1);
	let txnId=document.getElementById("txnId").value;
	let reqdata='{"otp": "'+otp+'","txnId":"'+txnId+'"}';
    let response= await fetch(url,{
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',
        },
		body: reqdata
    });
    let data = await response.json();
	document.getElementById("auth-token").value=data.token
    return data;

}

async function getBeneficiaries(){
	let url="https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries";
	let token=document.getElementById("auth-token").value ? document.getElementById("auth-token").value.toString(): "Default";
    this.bearer = "Bearer "+token;
	let response= await fetch(url,{
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',
		'authorization': this.bearer
        }
    });
    let data = await response.json();
	var htmlStr="";
	var j=1;
	for(i=0; i<data.beneficiaries.length;i++){
		var benId=data.beneficiaries[i].beneficiary_reference_id;
		var benName=data.beneficiaries[i].name;
		htmlStr+="<div class=\"list\"><h3>"+(j++)+'. '+benName+" - </h3>&nbsp;<h4>"+benId+"</h4><br></div>";
	
	}
	document.getElementById("response").innerHTML=htmlStr==""?"No beneficiaries found for logged in user":htmlStr;
    return data;
}

async function _scheduleAppointment(sessId, bearer){
    let beneficiary="50204571046980";
    let dose='2';
    let slot='09:00AM-11:00AM';
    let reqdata='{"dose": '+dose+', "session_id": "'+sessId+'", "slot": "'+slot+'", "beneficiaries": ["'+beneficiary+'"]}'
    let url="https://cdn-api.co-vin.in/api/v2/appointment/schedule";
    let response= await fetch(url,{
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
        'accept': 'application/json',
        'authorization': bearer,
        'content-type': 'application/json'
        },
        body: reqdata // body data type must match "Content-Type" header
    });
    let data = await response.json();
    return data;
}