import React from "react";
import Sessions from "../Sessions";

export default class SearchByPin extends React.Component{
    
    
    constructor(props){
        super(props);
        this.state={
            tracker:"Track",
            list:[]
        }
        this.pin="";
        this.getListByPin=this.getListByPin.bind(this);
        this.clickHandler=this.clickHandler.bind(this);
    }

    async getListByPin(){
        let list=[];
        let newDate = new Date();
        let appDate=newDate.getDate()+'-'+(newDate.getMonth()+1)+'-'+newDate.getFullYear();
        let url="https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode="+this.pin+"&date="+appDate;
        let response= await fetch(url,{
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
            }
        });
        let data = await response.json();
        list.push(<Sessions inpObj={this.props.inpObj} data={data} clbk={this.props.clbk}/>)
        //if(this.props.inpObj.appointment===null&&sessList.length>0)this.props.clbk(sessList);
        this.setState({list:list});
        return data;
    }
    clickHandler(){
        if(this.state.tracker==="Track"){
            this.intId=setInterval(()=>{this.getListByPin()},1000);
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
        disp.push(<input type='number' maxLength={6} onChange={(e)=>{return this.pin=e.target.value}}/>);
        disp.push(<button onClick={this.clickHandler} >{this.state.tracker}</button>);
        disp.push(<div><label>Filters:- Cost - {this.props.inpObj.fee_type}, Age_limit - {this.props.inpObj.min_age_limit}, Vaccine - {this.props.inpObj.vaccine}, Dose - {this.props.inpObj.dose}</label></div>);
        disp=[...disp, ...this.state.list];
        return disp;
    }
    render(){
        return(
            <div>{this.display()}</div>
        );
    }
}