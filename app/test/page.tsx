import React, { useState, useEffect } from 'react';

type Props = {
  title: string;
  count?: number;
};

const ExampleComponent: React.FC<Props> = ({ title, count = 0 }) => {
  const [value, setValue] = useState<number>(count);
  useEffect(() => {
    console.log('mounted');
  }, []);

  function handleClick() {
    setValue(value + 1);
  }

  return (
    <div style={{ padding: '10px', backgroundColor: '#eee' }}>
      <h1>{title}</h1>
      <p>Value:{value}</p>
      <button onClick={handleClick}>Increase</button>
      {value > 5 && <span> High value</span>}
    </div>
  );
};

export default ExampleComponent;
