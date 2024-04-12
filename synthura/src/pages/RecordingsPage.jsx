import React, { useState } from 'react';

let camera_number = 0;
let existance_number = 0
function DynamicTable() {
  const [rows, setRows] = useState([]);

  const addElement = () => {
    const newRow = [...rows];
    const lastRow = newRow[newRow.length - 1];
    camera_number += 1;
    existance_number += 1;
    const idString = camera_number;
    if (!lastRow || lastRow.length === 3) {
      newRow.push([]);
    }
    newRow[newRow.length - 1].push({ id: idString, name: existance_number});
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
    camera_number--;
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
      <button onClick={addElement} style={{fontSize: "20px", fontFamily: 'OCR A Std, monospace', borderRadius: "10px", backgroundColor: "black", color: "white"}}>Add Element</button>
      <p>Total Elements: {getTotalElements()}</p>
      <table>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((element, elementIndex) => (
                <td key={element.id} style={{border: '1px solid black', borderRadius: '5px!important', padding: '2px 40px 25px 40px'}}>
                  <h2>{"Camera " + element.id + ": " + element.name}</h2>
                  <center>
                    <div style={{border: '1px solid black', borderRadius: '5px!important', backgroundColor: "#D9D9D9", height: "230px", width: "260px"}}></div>
                    <div style={{padding: '0px 40px 0px 0px'}}>
                      <table>
                        <tbody>
                          <tr>
                            <td style={{padding: '0px 10px 0px 0px'}}>
                              <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "50%", backgroundColor: "red"}}></div>
                            </td>
                            <td>
                              <h3>Dangerous - <br/>10:54:26 to 10:59:50</h3>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "50%", backgroundColor: "purple"}}></div>
                            </td>
                            <td>
                              <h3>Potential Threat - <br/>10:54:26 to 10:59:50</h3>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <button onClick={() => deleteElement(rowIndex, elementIndex)} style={{fontSize: "20px", fontFamily: 'OCR A Std, monospace', borderRadius: "10px", backgroundColor: "black", color: "white"}}>
                      Delete Recording
                    </button>
                  </center>
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
    <div style={{backgroundImage: 'url("https://gifdb.com/images/high/black-background-star-constellation-9yh7ozd1p01cctby.gif")', backgroundSize: 'cover', fontFamily: 'OCR A Std, monospace' ,overflow: "auto", position: "fixed", border: '1px solid black', borderRadius: '5px!important', padding: '2px 40px 25px 75px', height: "100%", width: "100%", backgroundColor: "gray", color: "white"}}> 
      <h1>Saved Recordings: </h1>
      <DynamicTable />
    </div>
  );
}

export default RecordingsPage;