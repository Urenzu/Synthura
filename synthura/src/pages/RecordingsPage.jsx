import React, { useState } from 'react';

let camera_number = 0;
let existance_number = 0;
var example_dict = {
  1: "Yamato",
  2: "Nagasaki",
  3: "Itadori",
  4: "Toji"
};

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

    if (idString in example_dict) {
      newRow[newRow.length - 1].push({ id: idString, name: example_dict[idString]});
    }
    else {
      newRow[newRow.length - 1].push({ id: idString, name: existance_number});
    }
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

  const test_component = () => {
    return (
      <>
        <div id="video_window"></div>
        <div id="analytics_window">
          <table>
            <tbody>
              <tr>
                <td id="analytics_window_row">
                  <div id="analytics_window_circle_red"></div>
                </td>
                <td>
                  <h3>Dangerous - <br />10:54:26 to 10:59:50</h3>
                </td>
              </tr>
              <tr>
                <td>
                  <div id="analytics_window_circle_purple"></div>
                </td>
                <td>
                  <h3>Potential Threat - <br />10:54:26 to 10:59:50</h3>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div>
      <button onClick={addElement} class="unique_button">Add Element</button>
      <p>Total Elements: {getTotalElements()}</p>
      <table>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((element, elementIndex) => (
                <td key={element.id} id="dynamic_table_row">
                  <center>
                  <h2>{"Camera " + element.id + ": " + element.name}</h2>
                    {test_component()}
                    <button onClick={() => deleteElement(rowIndex, elementIndex)} className="unique_button">
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
    <div id="recording_page_container"> 
      <h1><strong>Saved Recordings: </strong></h1>
      <DynamicTable />
    </div>
  );
}

export default RecordingsPage;