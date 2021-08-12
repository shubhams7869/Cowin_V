import React from "react";
import Card from "../Card";

export default class Sessions extends React.Component{
    constructor(props){
        super(props);
        this.state={
            list:[]
        };
    }

    display(){
        let list=[],cls;
        let filters=this.props.inpObj.nameFilters.split(',');
        for(let i=0;i<this.props.data.centers.length;++i){
            if(this.props.inpObj.nameFilters!=='') {
                if(!filters.some(v => this.props.data.centers[i].name.toUpperCase().includes(v.toUpperCase())))
                continue;
            }
            if(this.props.inpObj.fee_type.toString()==='all' || this.props.data.centers[i].fee_type.toString()===this.props.inpObj.fee_type.toString()){
                list.push(<br/>);
                for(let j=0;j<this.props.data.centers[i].sessions.length;++j){
                    cls='card ';
                    if(parseInt(this.props.data.centers[i].sessions[j].available_capacity_dose1)>0){
                        if(parseInt(this.props.data.centers[i].sessions[j].available_capacity_dose2)>0) cls+='available';
                        else cls+='partial';
                    }
                    else if(parseInt(this.props.data.centers[i].sessions[j].available_capacity_dose2)>0) cls+='partial';
                    else cls+='booked';
                    //console.log(this.props.inpObj);
                    
                    if(this.props.inpObj.vaccine==="all"||this.props.data.centers[i].sessions[j].vaccine===this.props.inpObj.vaccine){                            
                        if(this.props.data.centers[i].sessions[j].min_age_limit===this.props.inpObj.min_age_limit ||this.props.data.centers[i].sessions[j].allow_all_age){
                            if(parseInt(this.props.inpObj.dose==="dose1"?this.props.data.centers[i].sessions[j].available_capacity_dose1:this.props.data.centers[i].sessions[j].available_capacity_dose2)>0){
                                if(this.props.inpObj.appointment===null)this.props.clbk(this.props.data.centers[i].sessions[j]);//sessList.push(this.props.data.centers[i].sessions[j]);
                            }
                            cls+=" session";
                            list.push(
                            <Card className={cls}>
                                <h3><b>{this.props.data.centers[i].name}</b> - {this.props.data.centers[i].fee_type}</h3>
                                <h3>{this.props.data.centers[i].sessions[j].date}</h3>
                                <h5>{this.props.data.centers[i].sessions[j].min_age_limit==='18'||this.props.data.centers[i].sessions[j].allow_all_age?"18 & above":"45+"}<br/>
                                    Slots Available: {this.props.data.centers[i].sessions[j].vaccine}<br/>
                                    Dose 1: {this.props.data.centers[i].sessions[j].available_capacity_dose1}<br/>
                                    Dose 2: {this.props.data.centers[i].sessions[j].available_capacity_dose2}
                                </h5>
                            </Card>);
                            
                        }
                    }                                
                }
            }
        }
        return list;
    }

    render(){
        
        return(
            <div>{this.display()}</div>
        );
    }
}