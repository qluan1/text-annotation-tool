import React, {useEffect} from 'react';

function LabelList (props) {

    return (
        <ul>
            {props.labelArray.map((o) => {
                return (
                    <li 
                        key = {o.name}
                    >
                        {o.name + ` {startIndex: ${o.start}, endIndex: ${o.end}}`}
                    </li>
                );
            })}
        </ul>
    );
}

export default LabelList;