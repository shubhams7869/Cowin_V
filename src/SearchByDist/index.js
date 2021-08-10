import { Component } from "react";
import Sessions from "../Sessions";
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
        list.push(<Sessions inpObj={this.props.inpObj} data={data} clbk={this.props.clbk}/>)
        //if(this.props.inpObj.appointment===null&&sessList.length>0)this.props.clbk(sessList);
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
    componentWillUnmount(){
        if(this.intId)
            clearInterval(this.intId);
        this.setState({tracker:"Track"});
    }
    display(){
        let disp=[];
        disp.push(<Dropdown onChange={(e)=>{this.state_id=e.target.value;this.getDistricts()}} options={this.state.states} />);
        disp.push(<Dropdown onChange={(e)=>{this.dist=e.target.value}} options={this.state.dists} />);
        disp.push(<button onClick={this.clickHandler} >{this.state.tracker}</button>);
        disp.push(<div><label>Filters- Cost: {this.props.inpObj.fee_type}, Age_limit: {this.props.inpObj.min_age_limit}, Vaccine: {this.props.inpObj.vaccine}, Dose: {this.props.inpObj.dose}</label></div>);
        disp=[...disp, ...this.state.list];
        return disp;
    }
    render(){
        return(
            <div>{this.display()}</div>
        );
    }
}