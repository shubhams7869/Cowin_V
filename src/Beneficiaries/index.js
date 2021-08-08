import React from 'react';
import Card from '../Card';
import './Beneficiaries.css'

export class Beneficiaries extends React.Component {

        constructor(props){
            super(props);
            this.benList=props.benList;
            this.list=[];
            for(let i=0;i< this.benList.length;i++){
                let age = new Date().getFullYear() - this.benList[i].birth_year;
                let name=this.benList[i].name;
                let benId = this.benList[i].beneficiary_reference_id;
                let vaccStatus = this.benList[i].vaccination_status;
                let cls='beneficiary';
                if(vaccStatus==='Partially Vaccinated'){
                    cls+=" partial";
                    this.list.push(<Card className={cls}><input type="radio" name="benList" onClick={this.props.onClick} value={benId} /> {name} ({age}) : {vaccStatus}</Card>);
                }
                else if(vaccStatus==='Vaccinated'){
                    cls+=" vaccinated"
                    this.list.push(<Card className={cls}><input type="radio" disabled={true} name="benList" onClick={this.props.onClick} value={benId} /> {name} ({age}) : {vaccStatus}</Card>);
                }
                else{
                    cls+=' notVaccinated';
                    this.list.push(<Card className={cls}><input type="radio" name="benList" onClick={this.props.onClick} value={benId} /> {name} ({age}) : {vaccStatus}</Card>);
                }
            }
        }

        render() {            
            return (
                <div className="beneficiaries">{this.list}</div>
            );
        }

}
