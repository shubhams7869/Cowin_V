import React from "react";
import Card from "../Card";

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
        let list=[], cls='card ',sessList=[];

        let filters=this.props.inpObj.nameFilters.split(',');
        for(let i=0;i<data.centers.length;++i){
            if(this.props.inpObj.nameFilters!=='') {
                if(!filters.some(v => data.centers[i].name.toUpperCase().includes(v.toUpperCase())))
                continue;
            }
            if(this.props.inpObj.fee_type.toString()==='all' || data.centers[i].fee_type.toString()===this.props.inpObj.fee_type.toString()){
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
                            cls+=" session";
                            //list.push(<Card className='card'><h3><b>{data.centers[i].name}</b> - {data.centers[i].fee_type}</h3><h5>{data.centers[i].address}</h5></Card>);
                            list.push(
                            <Card className={cls}>
                                <h3><b>{data.centers[i].name}</b> - {data.centers[i].fee_type}</h3>
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
        if(this.props.inpObj.appointment===null&&sessList.length>0)this.props.clbk(sessList);
        this.setState({list:list});
        return data;
    }
    clickHandler(){
        if(this.state.tracker==="Track"){
            this.intId=setInterval(()=>{this.getListByPin()},8000);
            this.setState({tracker:"Stop"});
        }
        else{
            clearInterval(this.intId);
            this.setState({tracker:"Track"});
        }
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