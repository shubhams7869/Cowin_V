import React from 'react';
import sha256 from '../SHA256';
import { Beneficiaries } from '../Beneficiaries';
import './Login.css';

export default class Login extends React.Component {

    txnId = null;
    
    constructor(props) {
        super(props);
        console.log("constructor() called!!");
        this.state = {
            mobile: null,
            token: null,
            msg: "Send OTP"
        };
        this.loginHandler=this.loginHandler.bind(this);
        this.generateOTP=this.generateOTP.bind(this);
    }

    reset (logout){
        clearInterval(this.interval);
        this.setCookie('token','');
        if(logout){
            console.log('Logging out!!');
            this.setState({
                msg:"Send OTP",
                mobile:''
            });
        }
        else{
            console.log('Resetting...');
            this.setState({
                msg:"Send OTP"
            });
        }
    }

    checkState(){
        if(this.getCookie('token') && this.getCookie("token")==="" && (this.state.msg!=="Send OTP" && this.state.msg!=="Confirm OTP")){
            this.setState({
                msg: "Send OTP"
            });
            this.reset();
        }
    }

    setCookie(cname, cvalue, ttlmin) {
        const d = new Date();
        d.setTime(d.getTime() + (ttlmin*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }
    
    getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

    async loginHandler(){
        if(this.state.msg==="Send OTP"){
            await this.generateOTP();
        }
        else if(this.state.msg==="Confirm OTP"){
            await this.confirmOTP();
        }
        else if(this.state.msg==="getBeneficiaries"){
            await this._getBeneficiaries();
        }
    }

    
    async generateOTP() {
        let url = "https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP";
        let mobile = this.state.mobile?this.state.mobile:document.getElementById('login').value;
        if (!mobile.match(/^\d{10}$/g)) {
            var msg = mobile ? 'Not a valid Mobile number!!' : 'Enter a mobile number!!';
            alert(msg);
            return;
        }
        let reqdata = '{"mobile": "' + mobile + '","secret":"U2FsdGVkX19/McGZM4NEQd5p2SWF6Y0xW3qN7nRTdVMFVEWX7p/TBUziMOxvFx/WBPyJm16JTvVGx3IK29kEsw=="}';
        let response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: reqdata
        });
        
        let data = await response.json();
        this.txnId = data.txnId;

        if (this.state.mobile === null) {
            this.setState({
                mobile: mobile,
                msg: "Confirm OTP"
            },this.myLogin);
            document.getElementById('login').value = "";
        }

        return data;
    }


    async confirmOTP() {

        let url = "https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp";
        let otp1 = document.getElementById("login").value;
        if(!otp1)return null;
        let otp = sha256(otp1);
        let txnId = this.txnId;
        let reqdata = '{"otp": "' + otp + '","txnId":"' + txnId + '"}';
        let response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/json',
            },
            body: reqdata
        });
        if(!response.ok)
            return;
        let data = await response.json();
        this.setState({
            token: data.token,
            msg: "getBeneficiaries"
        });
        this.setCookie("token", data.token, 15);
        return data;
    }

    async getBeneficiaries() {
        let url = "https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries";
        let token = this.state.token ? this.state.token : this.getCookie('token');
        this.bearer = "Bearer " + token;
        let response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/json',
                'authorization': this.bearer
            }
        });

        if (!response.ok) {
            this.reset();
                       
            return null;
        }
        return  response.json();
    }

    async _getBeneficiaries(){
        let benList;
        await this.getBeneficiaries().then(data => {
                //console.log(data); // JSON data parsed by `data.json()` call
                benList=data.beneficiaries;
                this.setState({
                    benList: benList,
                    msg: "Logged In"
                });
                return benList;
            });
    }
    myLogin ()  {
        console.log("myLogin() called!!");
        if (this.state.msg === "Send OTP") {
            if(this.getCookie("token") && this.getCookie("token")!=="" && this.getCookie("token")!=="undefined"){
                this.setState({
                    msg:"getBeneficiaries",
                    token:this.getCookie("token")
                });
            }
            else if(this.state.mobile && this.state.mobile!==null){
                this.loginHandler();
                return;
            }
            return <div>
                <input type='text' id='login' autoFocus={true} placeholder="Enter Mobile" defaultValue={this.state.mobile} />
                <button onClick={this.loginHandler}>{this.state.msg}</button>
            </div>
        }
        else if (this.state.msg === "Confirm OTP") {
            return <div>
                <input type='text' id='login' autoFocus={true} placeholder="Enter OTP" />
                <button onClick={this.loginHandler}>{this.state.msg}</button>
            </div>
        }

        else if(this.state.msg === "getBeneficiaries"){
            this._getBeneficiaries();
        }

        else if(this.state.msg==="Logged In"){
            this.interval = setInterval(() => { this.getBeneficiaries()}, 300000);
            this.props.onChange(this.state.benList,this.state.token);
            return <div><Beneficiaries benList={this.state.benList} onClick={()=>this.props.onChange(this.state.benList,this.state.token)}/><button onClick={()=>{this.reset(true)}}>Logout</button></div>
        }
        
    }
    render() {
        return (
            <div className="login">{this.myLogin()}</div>
        );
    }
}
