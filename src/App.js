import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { AgGridColumn, AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

const App = () => {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    refreshData();
  }, []);

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  }



  const refreshData = e => {
    document.querySelectorAll('.piccount').forEach((element)=> element.innerText="Loading Images...");
    
    fetch(
      "https://api.nasa.gov/planetary/apod?api_key=xE8H0ER9bxzelj6850UugbXcs5wi5cgEq1tZcvSv&count=15&thumbs=true"
    )
      .then(response => {
        if(response.ok){
          return response.json();
        }else{
          throw new Error("NASA API Issue");
        }
      })
      .then(data => rowData.concat(data))
      .then(data => {document.querySelectorAll('.piccount').forEach((element)=> element.innerText="");return data;})
      .then(rowData => setRowData(rowData))
      .then(gridApi?.hideOverlay())
      .catch(error => {console.log(error);document.querySelectorAll('.piccount').forEach((element)=> element.innerText="Loading Error: Try Again");})
      ;
  };

// add loading overlay

  return (
    <div>
      <h1>Random Nasa Pictures of the Day</h1>
      {/*
      <ul>
        <li>Date is sortable</li>
        <li>Date links to apod.nasa.gov page</li>
        <li>Click on Image to see original</li>
        <li>Filter on explanation</li>
      </ul>
      */}
      <button onClick={refreshData}>Get More Pictures</button><span class="piccount"></span>
      <div className="ag-theme-alpine" style={{ height: 700, width: "100%" }}>
        <AgGridReact onGridReady={onGridReady} rowData={rowData}
          pagination={true}
          paginationPageSize={10}
        >
          <AgGridColumn
            field="date"
            width="120"
            sortable={true}
            resizable={true}
            cellRenderer={function(params) {
              const mydateVals = params.value.split("-");
              var myurl =
                "https://apod.nasa.gov/apod/" +
                "ap" +
                mydateVals[0].substr(-2, 2) +
                mydateVals[1] +
                mydateVals[2] +
                ".html";
              return (
                "<a href='" +
                myurl +
                "' target='_blank'>" +
                params.value +
                "</a>"
              );
            }}
          />
          <AgGridColumn
            field="explanation"
            autoHeight={true}
            wrapText={true}
            filter="agTextColumnFilter"
            resizable={true}
            width={400}
            cellRenderer={function(params) {
              return (
                "<div style='word-break:normal;line-height: normal'><p>" +
                params.value +
                "</p></div>"
              );
            }}
          />

          <AgGridColumn
            field="url"
            flex="1"
            autoHeight={true}
            headerName="Image"
            cellRenderer={function(params) {
              if (params.node.data.media_type == "image") {
                return (
                  "<a href='" +
                  params.value +
                  "' target='_blank'><!--'max-width:100%; height:auto' -->" +
                  "<img style='height:100%' src='" +
                  params.value +
                  "'" +
                  "alt='" +
                  params.node.data.title +
                  "'/>" +
                  "</a>"
                );
              }
              if (params.node.data.media_type == "video") {
                return (
                  "<a href='" +
                  params.value +
                  "' target='_blank'>Watch Video Now<br><img  style='height:100%' src='" +
                  params.node.data.thumbnail_url +
                  "'/>" +
                  "</a>"
                );
              }
              return params.node.data.media_type;
            }}
          />
        </AgGridReact>
      </div>
      <div style={{"text-align":"right"}} >
      <span class="piccount"></span><button onClick={refreshData}>Get More Pictures</button>
      </div>

      <p>
        <a href="https://apod.nasa.gov/apod/archivepix.html" target="_blank">
          Visit full archive
        </a>
      </p>
      <p>
        Created with{" "}
        <a href="https://api.nasa.gov/" target="_blank">
          NASA's apod API
        </a>
        ,{" "}
        <a href="https://reactjs.org/" target="_blank">
          ReactJS
        </a>
        , and{" "}
        <a href="https://www.ag-grid.com/" target="_blank">
          AG Grid (Community Edition)
        </a>
      </p>
    </div>
  );
};

export default App;
