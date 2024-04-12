import React, { useState } from 'react';

let number = 0;
function DynamicTable() {
  const [rows, setRows] = useState([]);

  const addElement = () => {
    const newRow = [...rows];
    const lastRow = newRow[newRow.length - 1];
    number += 1;
    const idString = number;
    if (!lastRow || lastRow.length === 3) {
      newRow.push([]);
    }
    newRow[newRow.length - 1].push({ id: idString });
    setRows(newRow);
  };

  const deleteElement = (rowIndex, elementIndex) => {
    const newRow = [...rows];
    newRow[rowIndex].splice(elementIndex, 1);
    for (let i = rowIndex + 1; i < newRow.length; i++) {
      if (newRow[i].length > 0) {
        newRow[i - 1].push(newRow[i].shift());
      } else {
        break;
      }
    }
    number--;
    setRows(newRow.filter(row => row.length > 0));
    for (let r = rowIndex; r < rows.length; r++)
    {
      if (r == rowIndex){
        for (let c = elementIndex; c < rows[r].length; c++) {
          rows[r][c].id = rows[r][c].id - 1
        }
      }
      else{
        for (let c = 0; c < rows[r].length; c++) {
          rows[r][c].id = rows[r][c].id - 1
        }
      }
    }
    setRows(newRow.filter(row => row.length > 0));
  };

  // Function to calculate the total number of elements
  const getTotalElements = () => {
    return rows.reduce((total, row) => total + row.length, 0);
  };

  return (
    <div>
      <button onClick={addElement}>Add Element</button>
      <p>Total Elements: {getTotalElements()}</p>
      <table>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((element, elementIndex) => (
                <td key={element.id} bord>
                  <div>
                    <center>
                      <h2>{"Camera " + element.id + ": Name"}</h2>
                      <button onClick={() => deleteElement(rowIndex, elementIndex)}>
                        Delete Recording
                      </button>
                    </center>
                  </div>
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - row.length) }, (_, index) => (
                <td key={`empty-${rowIndex}-${index}`}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordingsPage() {
  return (
    <div>
      <h1>Saved Recordings: </h1>
      <center>
        <DynamicTable />
      </center>
    </div>
  );
}

export default RecordingsPage;