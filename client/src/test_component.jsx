import React from 'react';

function TestComponent(props) {
  const alertName = () => {
    alert(props.name);
  };

  return (
    <div>
      <h3> {props.name} </h3>
      <button onClick={alertName}> alert </button>
    </div>
  );
};

export default TestComponent;