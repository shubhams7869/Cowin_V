import React from "react";
import { Link, Route, MemoryRouter as Router} from 'react-router-dom';
import Login from '../Login';
import SearchByPin from "../SearchByPin";
import SearchByDist from "../SearchByDist";


export default class Tracker extends React.Component {

    constructor(){
        super();
        this.state={
            appointment_id:null
        };
        this.outObj={
            token:'',
            bid:'',
            sesslist:[]
        }
        this.inpObj={
            fee_type:'Free',
            min_age_limit:'18',
            dose:'dose1',
            vaccine:'all',
            nameFilters:''
        };
        this.searchResponse=this.searchResponse.bind(this);
        this.loginResponse=this.loginResponse.bind(this);
    }
    loginResponse=(list,token)=>{
        let ids=document.getElementsByName('benList');
        let benId='';
        for(let i=0;i<ids.length;++i){
            if(ids[i].checked===true){
                benId=ids[i].value;
                console.log(benId);
                this.inpObj.min_age_limit=(new Date().getFullYear() - list[i].birth_year)>45?'45':'18';
                this.inpObj.dose=list[i].vaccination_status==='partially vaccinated'?'dose2':'dose1';
                this.inpObj.vaccine=this.inpObj.dose==='dose2'?list[i].vaccine:this.inpObj.vaccine;
                break;
            }
        }
        this.outObj.token=token;
        this.outObj.bid=benId;
    }

    searchResponse(sessList){
        this.outObj.sesslist=sessList.length>0?[...sessList]:[];
        if(this.outObj.bid!==''&&this.outObj.sesslist.length >0)this.scheduleAppointment();
    }
    async _scheduleAppointment(sessId){
        let beneficiary=this.outObj.bid;
        let dose=this.inpObj.dose==="dose1"?1:2;
        let slot=this.slots[0];
        let token = this.outObj.token;
        let bearer = "Bearer " + token;
        //getCaptcha();	
        //let securityCode=this.securityCode;
        
        let reqdata='{"dose": "'+dose+'", "session_id": "'+sessId+'", "slot": "'+slot+'", "beneficiaries": ["'+beneficiary+'"]}'
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
        if(!response.ok) return;
        let data = await response.json();
        this.setState({
            appointment_id:data.appointment_id
        });
        return data;
    }

    scheduleAppointment(){
        let sessId,res;
        if(this.state.appointment_id!==null) return;
        if(this.outObj.sesslist.length>0){
            let list=this.outObj.sesslist;
            for(let i=0; i<list.length;i++){
                sessId=list[i].session_id;
                this.slots=list[0].slots;
                console.log("Trying to schedule Appointment...");
                res = this._scheduleAppointment(sessId);
                if(res.appointment_id) return <div>res.appointment_id</div>;
                console.log(res);
            }
        }
        else if(this.state.appointment_id){
            return <div>{this.state.appointment_id}</div>
        }
    }
    display(){
        let disp=[];
        disp.push(
        <div>
            <table width="100%" align="center">
                <tbody>
                <tr>
                    <td colSpan='2'><Login onChange={this.loginResponse}/></td>
                </tr>
                <tr>
                    <td>Cost: 
                        <select id="fee_type" onChange={(e)=>{this.inpObj.fee_type=e.target.value}} name="fee_type" defaultValue={this.inpObj.fee_type}>
                            <option value="all">All</option>
                            <option value="Free">Free</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </td>
                    <td>Age: 
                        <select id="min_age_limit" onChange={(e)=>{this.inpObj.min_age_limit=e.target.value}} name="min_age_limit" defaultValue={this.inpObj.min_age_limit}>
                            <option value="18">18+</option>
                            <option value="45">45+</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>Vaccine: 
                        <select id="vaccine" onChange={(e)=>{this.inpObj.vaccine=e.target.value}} name="vaccine" defaultValue={this.inpObj.vaccine}>
                            <option value="all">All</option>
                            <option value="COVAXIN">COVAXIN</option>
                            <option value="COVISHIELD">COVISHIELD</option>
                            <option value="SPUTNIK V">SPUTNIK V</option>
                        </select>
                    </td>
                    <td><select id="dose" onChange={(e)=>{this.inpObj.dose=e.target.value}} name="dose" defaultValue={this.inpObj.dose}>
                            <option value="dose1">Dose 1</option>
                            <option value="dose2">Dose 2</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td colSpan='2'>Name Filter: <input type='text' placeholder="keyword to filter separated by comma(,)" onChange={e=>{this.inpObj.nameFilters=e.target.value}} /></td>
                </tr>
                <Router>
                <tr>
                    <td><Link to='/pin' >Search By Pincode</Link></td>
                    <td><Link to='/dist'>Search By District</Link></td>
                </tr>
                <tr>
                    <td colSpan='2'>
                        <Route path='/pin'><SearchByPin inpObj={this.inpObj} clbk={this.searchResponse}/></Route>
                        <Route path='/dist'><SearchByDist inpObj={this.inpObj} clbk={this.searchResponse}/></Route>
                    </td>
                </tr>
                </Router>
                <tr>
                    <td colSpan='2'>
                        {this.scheduleAppointment()}
                    </td>
                </tr>
                </tbody>
            </table>
            <hr/>

        </div>);

        return disp;
    }

    render(){
        return(
            <div>{this.display()}</div>
        );
    }
}