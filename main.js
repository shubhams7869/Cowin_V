function execute(){
	this.fee_type=document.getElementById("fee_type").value;
	this.min_age_limit=document.getElementById("min_age_limit").value;
	this.vaccine=document.getElementById("vaccine").value;
	this.dose=document.getElementById("dose").value;
	this.bens=document.getElementById("benList").value.split(',');
	this.runId=setInterval(run,3500);
}
async function run(){
    await checkLogin();
    let token=document.getElementById("auth-token").value ? document.getElementById("auth-token").value.toString(): "";
    this.bearer = "Bearer "+token;
    
    let list = await getList();

    for(i=0; i<list.centers.length;i++){
	if(this.fee_type=="all" || list.centers[i].fee_type==this.fee_type)
	  if(this.vaccine=="all"||list.centers[i].sessions[0].vaccine==this.vaccine)
            if(parseInt(this.dose=="dose1"?	list.centers[i].sessions[0].available_capacity_dose1:list.centers[i].sessions[0].available_capacity_dose2)>0)
            	if(list.centers[i].sessions[0].min_age_limit==this.min_age_limit){
                //if(list.centers[i].center_id=="396505") // center id for KBHB
                    sessId=list.centers[i].sessions[0].session_id;
                    this.slots=list.centers[i].sessions[0].slots;
                    console.log("Trying to schedule Appointment...");
		    res = await _scheduleAppointment(sessId, this.bearer, this.bens);
			if(res.appointment_id)clearInterval(this.runId);
                    console.log(res);
		}
		
    }
                
	document.getElementById("response").innerHTML=res;
}

async function getList(){
	
	let token=document.getElementById("auth-token").value ? document.getElementById("auth-token").value.toString(): "";
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
		htmlStr+="<div class=\"list\"><label><h3>"+(j++)+'. '+list.centers[i].name+" - </h3></label>&nbsp;<label><h5 style='background: green; border-radius:25px;padding: 2px;'>"+ageLimit+"</h5></label><br><label><h2 style='text-align: center;'> - Slots: "+list.centers[i].sessions[0].available_capacity+"</h2></label></div>";
	
	}
	document.getElementById("response").innerHTML=htmlStr==""?"No Vaccination center found for date: "+this.appDate+" and pincode: "+this.pin:htmlStr;
}

async function _getList(appDate, pin, bearer){
    let url="https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode="+pin+"&date="+appDate;
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
	var phoneno = /^\d{10}$/;
	if(!mobile.match(phoneno))
	{
		var msg= mobile?'Not a valid Mobile number!!':'Enter a mobile number!!';
		var alertDiv=document.getElementById("alertBox");
		alertDiv.innerHTML="<div id='alertMsg' class='alert alert-danger alert-dismissible fade show'><strong>Error!</strong> "+msg+" . <button type='button' class='close' data-dismiss='alert'>&times;</button></div>";
		return;
	}
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
	var htmlres="<div class='input-group'><label><input type='number' id='otp' placeholder='Enter OTP'/><input type='hidden' id='txnId' value='"+this.txnId+"'/></label>&nbsp;<button class='unit' type='unit' title='Validate OTP' onclick='confirmOtp()'><span class='iconify' data-icon='ic:baseline-mobile-friendly' data-inline='false'></span></button></div>";
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
	document.getElementById("auth-token").value=data.token;
	closeDialog("login");
    return data;

}

async function checkLogin(){
	var res=await getBeneficiaries();
	if(!res){
		var dlgBody="<div class='input-group'><label id='generateOtp'><input type='tel' id='mobile' placeholder='Mobile Number'/></label>&nbsp;<button class='unit' type='button' title='Generate OTP' onclick='generateOtp()'><span class='iconify' data-icon='emojione-monotone:mobile-phone-with-arrow' data-inline='false'></span></button><br/></div><br/><label id='validateOtp'/>";
		showDialog("login","Login",dlgBody);
		return false;
	}
	else return true;
}

async function addBenDialog(){
	if(!checkLogin())return;
	var list=await getBeneficiaries();
	var htmlStr="";
	var j=1;
	for(i=0; i<list.beneficiaries.length;i++){
		var benId=list.beneficiaries[i].beneficiary_reference_id;
		var benName=list.beneficiaries[i].name;
		htmlStr+="<label><input type='checkbox' name='selectBen' id='selectBen' value='"+benId+"'><h3>"+(j++)+'. '+benName+" - </h3></label>&nbsp;<label><h4>"+benId+"</h4></label><br>";
	
	}
	if(htmlStr!="")htmlStr+="<label><button id=\"addSel\" onclick=\"selectBenList()\">Add Selected</button></label>";
showDialog("addBen","Select Beneficiary",htmlStr);
//document.getElementById("benList").innerHTML=htmlStr==""?"No beneficiaries found for logged in user":htmlStr;
}

function selectBenList(){
	var benList=document.getElementsByName("selectBen");
	var htmlStr="";
	
	for(var j=0;j<benList.length;j++)
	{
		htmlStr+=benList[j].checked?benList[j].value+",":"";
	}
	document.getElementById("benList").innerHTML=htmlStr==""?"No beneficiaries found for logged in user":htmlStr;
	closeDialog("addBen");
}

async function getBeneficiaries(){
	let url="https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries";
	let token=document.getElementById("auth-token").value ? document.getElementById("auth-token").value.toString(): "";
    this.bearer = "Bearer "+token;
	let response= await fetch(url,{
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',
		'authorization': this.bearer
        }
    }).catch(error => {
	  console.log(response.status);
	});
	
	if(!response.ok)return;

    let data = await response.json();
	/*var htmlStr="";
	var j=1;
	for(i=0; i<data.beneficiaries.length;i++){
		var benId=data.beneficiaries[i].beneficiary_reference_id;
		var benName=data.beneficiaries[i].name;
		htmlStr+="<div class=\"list\"><h3>"+(j++)+'. '+benName+" - </h3>&nbsp;<h4>"+benId+"</h4><br></div>";
	
	}
	document.getElementById("response").innerHTML=htmlStr==""?"No beneficiaries found for logged in user":htmlStr;*/
    return data;
}

async function _scheduleAppointment(sessId, bearer, bens){
    let beneficiary=bens.map(n=>n.toString());
    let dose=this.dose;
    let slot=this.slots[0];
    let reqdata='{"dose": '+dose+', "session_id": "'+sessId+'", "slot": "'+slot+'", "beneficiaries": ['+beneficiary+']}'
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

function closeDialog(id){
	$("#"+id).dialog( "close" );
}

function showDialog(id,title,body)
{
	var dialogBox='<div id="'+id+'" title="'+title+'">'+body+'</div>';
	var loginDialog=document.getElementById("alertBox");
	loginDialog.innerHTML=dialogBox;
	$("#"+id).css("text-color",'black');
	$("#"+id).dialog({
	  show: { effect: "blind", duration: 800 },
	  appendTo: "body",
	  dialogClass: "alert",
	  hide: { effect: "explode", duration: 1000 },
	  modal: true
	});
	$("#"+id).dialog( "open" );
}
