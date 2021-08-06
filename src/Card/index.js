import "./Card.css";
function Card(props){
    let classes=props.className;
    return(
        <div className={classes}>{props.children}</div>
    );
}

export default Card;