import { Component } from "react";
import Card from "../Card";
import Dropdown from "../Dropdown";

export default class SearchByDist extends Component{
    
    state_id=1;
    dist;
    constructor(props){
        super(props);
        this.state={
            states:"",
            dists:"",
            tracker:"Track",
            list:[]
        }
        this.getStates();
        this.getDistricts();
        this.getListByState=this.getListByState.bind(this);
        this.clickHandler=this.clickHandler.bind(this);

    }
    async getStates(){
        let url="https://cdn-api.co-vin.in/api/v2/admin/location/states"
        let response= await fetch(url,{
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
            }
        });
        let data = await response.json();
        this.stateList=[];
        for(let i=0;i<data.states.length;i++){
            this.stateList.push({"key":data.states[i].state_id, "value":data.states[i].state_name});
        }
        this.setState({
            states:this.stateList
        });
        return this.stateList;
    }
    
    async getDistricts(){
        let url="https://cdn-api.co-vin.in/api/v2/admin/location/districts/"+this.state_id;
        let response= await fetch(url,{
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
            }
        });
        let data = await response.json();
        this.distList=[];
        for(let i=0;i<data.districts.length;i++){
            this.distList.push({"key":data.districts[i].district_id, "value":data.districts[i].district_name});
        }
        this.setState({
            dists:this.distList
        });
        this.dist=this.distList[0].key;
        console.log(this.dist);
        return this.distList;
    }

    async getListByState(){
        let list=[];
        let newDate = new Date();
        let appDate=newDate.getDate()+'-'+(newDate.getMonth()+1)+'-'+newDate.getFullYear();
        let url="https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id="+this.dist+"&date="+appDate;
        let response= await fetch(url,{
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
            }
        });
        if(!response.ok){
            list.push(<div><h5>Something Went wrong!!</h5></div>)
            return;
        }
        let data = await response.json();
        let cls,sessList=[];
        for(let i=0;i<data.centers.length;++i){
            if(data.centers[i].fee_type.toString()===this.props.inpObj.fee_type.toString()){
                list.push(<br/>);
                for(let j=0;j<data.centers[i].sessions.length;++j){
                    cls='card ';
                    if(parseInt(data.centers[i].sessions[j].available_capacity_dose1)>0){
                        if(parseInt(data.centers[i].sessions[j].available_capacity_dose2)>0) cls+='available';
                        else cls+='partial';
                    }
                    else if(parseInt(data.centers[i].sessions[j].available_capacity_dose2)>0) cls+='partial';
                    else cls+='booked';
                    console.log(this.props.inpObj);
                    
                    if(this.props.inpObj.vaccine==="all"||data.centers[i].sessions[j].vaccine===this.props.inpObj.vaccine){                            
                        if(data.centers[i].sessions[j].min_age_limit===this.props.inpObj.min_age_limit ||data.centers[i].sessions[j].allow_all_age){
                            if(parseInt(this.props.inpObj.dose==="dose1"?	data.centers[i].sessions[j].available_capacity_dose1:data.centers[i].sessions[j].available_capacity_dose2)>0){
                                sessList.push(data.centers[i].sessions[j]);                            
                            }
                        
                            list.push(<Card className='card'><h3><b>{data.centers[i].name}</b> - {data.centers[i].fee_type}</h3><h5>{data.centers[i].address}</h5></Card>);
                            list.push(
                            <Card className={cls}>
                                <h3>{data.centers[i].sessions[j].date}</h3>
                                <h5>{data.centers[i].sessions[j].min_age_limit==='18'||data.centers[i].sessions[j].allow_all_age?"18 & above":"45+"}<br/>
                                    Slots Available: {data.centers[i].sessions[j].vaccine}<br/>
                                    Dose 1: {data.centers[i].sessions[j].available_capacity_dose1}<br/>
                                    Dose 2: {data.centers[i].sessions[j].available_capacity_dose2}
                                </h5>
                            </Card>);
                            
                        }
                    }                                
                }
            }
        }
        this.props.clbk(sessList);
        this.setState({list:list});
        return data;
    }

    clickHandler(){
        if(this.state.tracker==="Track"){
            console.log(this.dist);
            this.intId=setInterval(()=>{this.getListByState()},8000);
            this.setState({tracker:"Stop"});
        }
        else{
            clearInterval(this.intId);
            this.setState({tracker:"Track"});
        }
    }
    display(){
        let disp=[];
        disp.push(<Dropdown onChange={(e)=>{this.state_id=e.target.value;this.getDistricts()}} options={this.state.states} />);
        disp.push(<Dropdown onChange={(e)=>{this.dist=e.target.value}} options={this.state.dists} />);
        disp.push(<button onClick={this.clickHandler} >{this.state.tracker}</button>);
        disp=[...disp, ...this.state.list];
        return disp;
    }
    render(){
        return(
            <div>{this.display()}</div>
        );
    }
}