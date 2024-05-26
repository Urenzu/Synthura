import './RecordingsPage.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {MongoClient} from 'mongodb';

let camera_number = 0;
let existance_number = 0;
let user_id;

const testfunciton = async (context) => {
  const mongoClient = new MongoClient('mongodb+srv://githika:nKrMRdZ2iK8p3LcC@testcluster1.o64yucx.mongodb.net/test?retryWrites=true&w=majority&appName=testcluster1');
  const data = await mongoClient.db().collection('users').find().toArray();

  console.log("DATA IS", data);


}





function DynamicTable({ recordings, setRecordings, fetchRecordings }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (recordings && recordings.length > 0) {
      const formattedRows = [];
      let tempRow = [];

    
      // Convert the recordings array into rows for the DynamicTable
      recordings.forEach((recording, index) => {
        const { filename, _id } = recording;
        tempRow.push({ id: index + 1, name: filename, file_id: _id});
        if ((index + 1) % 3 === 0 || index === recordings.length - 1) {
          formattedRows.push(tempRow);
          tempRow = [];
        }
        camera_number = index + 1;
        existance_number = camera_number;
      });

      setRows(formattedRows);
    }
  }, [recordings]);
  
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
    const _id = recordings[(3 * rowIndex) + elementIndex]._id; // Ensure you have `_id` in your recordings objects
    console.log(user_id);
    console.log(_id);
    axios.delete(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/deleteRecording?username=${user_id}&_id=${_id}`)
        .then(response => {
          console.log('Deleted ObjectID:', _id );
          window.location.reload();
          // Proceed to update UI after successful backend deletion
          const newRecordings = [...recordings];
          newRecordings.splice((3 * rowIndex) + elementIndex, 1);
          setRecordings(newRecordings);

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
        })
        .catch(error => {
            console.error('Error deleting recording:', error);
        });
};

  const test_component = (videoSource) => {
    return (
      <>
        <MongoDBVideoPlayer fileId={videoSource} />
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
      <table>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((element, elementIndex) => (
                <td key={element.id} id="dynamic_table_row">
                  <center>
                  <h2>{"Camera " + element.id + ": " + element.name}</h2>
                    {test_component(element.file_id)}
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

function RecordingsPage2() {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecordings = async () => {
    try {
      setIsLoading(true); // Set loading to true before fetching recordings
      const response = await axios.get('https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/getRecordings?username=Nam');
      setRecordings(response.data[0]["recordings"]);
      user_id = response.data[0]["user"];
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setIsLoading(false); // Mark loading as complete whether successful or not
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  return (
    <div id="recording_page_container">
      <h1>Saved Recordings:</h1>
      <center>
      {isLoading ? ( // Display loading message if recordings are being fetched
        <p>Loading recordings...</p>
      ) : (
          <DynamicTable recordings={recordings} setRecordings={setRecordings} fetchRecordings={fetchRecordings} />
      )}
      </center>
    </div>
  );
}


export default RecordingsPage2;