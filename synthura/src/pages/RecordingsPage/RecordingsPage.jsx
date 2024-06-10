import './RecordingsPage.css';
import React, { useState, useEffect, useMemo } from 'react';
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

let camera_number = 0;
let existance_number = 0;
let user_id;

function DynamicTable({ recordings, setRecordings, fetchRecordings }) {
  const rows = useMemo(() => {
    if (!recordings || recordings.length === 0) return [];

    const formattedRows = [];
    let tempRow = [];

    // Convert the recordings array into rows for the DynamicTable
    recordings.forEach((recording, index) => {
      const { filename, _id } = recording;
      tempRow.push({ id: index + 1, name: filename, file_id: _id });
      if ((index + 1) % 3 === 0 || index === recordings.length - 1) {
        formattedRows.push(tempRow);
        tempRow = [];
      }
      camera_number = index + 1;
      existance_number = camera_number;
    });

    return formattedRows;
  }, [recordings]);

  const MongoDBVideoPlayer = ({ fileId }) => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchFile = async () => {
        try {
          setError(null);
      
          const fileMetadataResponse = await axios.get(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/getFileMetaData?fileID=${fileId}`);
          const totalChunksResponse = await axios.get(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/getTotalChunkCount?fileID=${fileId}`);
          const totalChunks = totalChunksResponse.data;
      
          const chunkRequests = [];
          for (let i = 0; i < totalChunks; i++) {
            chunkRequests.push(axios.get(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/getChunkData?fileID=${fileId}&chunkNumber=${i}`));
          }
      
          const chunkResponses = await Promise.all(chunkRequests);
          const fileData = chunkResponses.map(response => response.data.data.Data).join('');
      
          const binaryString = atob(fileData);
          const arrayBuffer = new ArrayBuffer(binaryString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
          }
      
          const blob = new Blob([arrayBuffer], { type: fileMetadataResponse.data.contentType });
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
        } catch (error) {
          setError(error.message || 'Error fetching file');
        }
      };
  
      fetchFile();
  
      return () => {
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
      };
    }, [fileId]);
  
    if (!videoUrl) {
      return <h2>Loading...</h2>;
    }
  
    return (
      <div>
        {error && <p>{error}</p>}
        {videoUrl && (
          <video className="recordings-window" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  };

  const addElement = () => {
    const newRow = [...rows];
    const lastRow = newRow[newRow.length - 1];
    camera_number += 1;
    existance_number += 1;
    const idString = camera_number;
    if (!lastRow || lastRow.length === 3) {
      newRow.push([]);
    }

    newRow[newRow.length - 1].push({ id: idString, name: existance_number });
    setRows(newRow);
  };

  const deleteElement = (rowIndex, elementIndex) => {
    const _id = recordings[(3 * rowIndex) + elementIndex]._id; // Ensure you have `_id` in your recordings objects
    console.log(user_id);
    console.log(_id);
    axios.delete(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/deleteRecording?username=${user_id}&_id=${_id}`)
        .then(response => {
          console.log('Deleted ObjectID:', _id );
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
        })
        .catch(error => {
            console.error('Error deleting recording:', error);
        });
  };

  const test_component = (videoSource) => {
    return (
      <>
        <MongoDBVideoPlayer fileId={videoSource} />
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
                    <div className="recording-header">
                      <button className="delete-feed-button" onClick={() => deleteElement(rowIndex, elementIndex)}>
                        <svg className="delete-feed-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 
                          0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 
                          32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                        </svg>
                      </button>
                      <h2>{"Environment: " + element.name}</h2>
                    </div>
                    {test_component(element.file_id)}
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

  const {state} = useLocation();
  const navigate = useNavigate();
  const username = state.username;
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecordings = async () => {
    try {
      setIsLoading(true); // Set loading to true before fetching recordings
      const response = await axios.get(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/getRecordings?username=${username}`);
      setRecordings(response.data[0]["recordings"]);
      user_id = response.data[0]["user"];
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setIsLoading(false); // Mark loading as complete whether successful or not
    }
  };

  const handleNavigateToMain = () => {
    console.log("Navigated to Main Page");
    navigate("/main", {state: {username: username}});
  }

  const handleSignOut = () => {
    navigate("/");
  }

  useEffect(() => {
    fetchRecordings();
  }, []);


  return (
    <section id="recordings-page" >
      <nav id="environments-page-nav-bar">
        <h3>Recordings</h3>
        <div className="links">
          <button onClick={handleSignOut}>Sign Out</button>
          <button onClick={handleNavigateToMain}>Environments</button>
        </div>
      </nav>
      <div id="recordings-container">
        {isLoading ? ( // Display loading message if recordings are being fetched
          <h2>Loading Recordings...</h2>
        ) : (
          <DynamicTable recordings={recordings} setRecordings={setRecordings} fetchRecordings={fetchRecordings} />
        )}
      </div>
    </section>
  );
}

export default RecordingsPage;
