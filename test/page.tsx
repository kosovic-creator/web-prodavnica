'use client';
import React, { useState } from 'react'
import Child from './dijete/page';
const Parent = () => {
    const [childValue, setChildValue] = useState('');
    return (
        <div>
            <h1>Roditelj</h1>
            <Child value={childValue} onChange={setChildValue} />
        </div>
    );
};

export default Parent;
