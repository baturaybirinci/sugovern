import { useState } from "react";
import * as constants from "../../constant";

export default function Admin() {
    const [expandedKey, setExpandedKey] = useState(null);
    const [newValues, setNewValues] = useState({});

    const handleClick = key => {
        setExpandedKey(expandedKey === key ? null : key);
    };

    const handleInputChange = (key, event) => {
        setNewValues({
            ...newValues,
            [key]: event.target.value,
        });
    };

    const updateConstant = async (key, newValue) => {
        const res = await fetch('/api/updateConstant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, newValue }),
        });

        const data = await res.json();

        // Do something with the response...
    };

    const handleUpdate = key => {
        updateConstant(key, newValues[key]);
    };

    return (
        <div>
            <h1>My Constants</h1>
            {Object.entries(constants.CONSTANT_DICT).map(([key, value], i) => (
                <div key={i} >
                    <h3 onClick={() => handleClick(key)}>Constant {i + 1}</h3>
                    <pre onClick={() => handleClick(key)}>{key}</pre>
                    {expandedKey === key && (
                        <div>
                            <pre>{JSON.stringify(value, null, 2)}</pre>
                            <input
                                type="text"
                                value={newValues[key] || ''}
                                onChange={(event) => handleInputChange(key, event)}
                            />
                            <button onClick={() => handleUpdate(key)}>Update</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
