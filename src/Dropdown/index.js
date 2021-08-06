function Dropdown(props) {
    return <>
        <select {...props}>
            {props.options &&
                props.options.map(o =>
                    <option key={o.key} value={o.key}>
{o.value}</option>)
            }
        </select>
    </>;
}
export default Dropdown;