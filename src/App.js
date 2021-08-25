import React, { useState, useEffect, memo, useMemo, useCallback} from "react";
import { render } from "react-dom";
import { AgGridColumn, AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

const VideoImageRenderer = memo(props => {

  const[imageStyle, setImageStyle] = useState({height:props.node.rowHeight + 'px', width:'auto'});

  const setImageBasedOnRowHeight = ()=>{
    setImageStyle(({height:props.node.rowHeight + 'px', width:'auto'}));
  }

  // if row height changes then amend the image size
  // TODO: when cell size adjustment added...once a px value has been set, we then want to amend it to height 100% width:auto to let the browser handle it
  useEffect(()=>{
    setImageBasedOnRowHeight();
  },[props.node.rowHeight])

  // TODO: combine these by calculating the variable parts early and adding to state based on props
  if(props.node.data.media_type=="image"){    
    return (
      <a href={props.value} target='_blank'>
        <img style={imageStyle} src={props.value} loading='lazy' alt={props.node.data.title} onLoad={setImageBasedOnRowHeight}/>
        </a>  
    )
  }

  if(props.node.data.media_type=="video"){
    return(
      <a href={props.value} target='_blank'>Watch Video Now<br/>
      <img style={imageStyle} src={props.node.data.thumbnail_url} loading='lazy' alt={props.node.data.title} onLoad={setImageBasedOnRowHeight}/>
      </a>
    )
  }

  return (
    <a href={props.value} target='_blank'>
      {props.node.data.media_type}
    </a>
  );

});

const DateRenderer= memo(props => {

      const mydateVals = props.value.split("-");
      var myurl = "https://apod.nasa.gov/apod/ap" + mydateVals[0].substr(-2, 2) + mydateVals[1] + mydateVals[2] + ".html";

      return (
        <a href={myurl} target='_blank'>{props.value}</a>
      );
});

const TextRenderer= memo(props => {
    return (
      <div style={{wordBreak: "normal", lineHeight: "normal"}}><p>
      {props.value}
      </p></div>
    );
});


const App = () => {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const [rowData, setRowData] = useState([]);

  // load data from api when grid first rendered
  useEffect(() => {
    refreshData();
  }, []);

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  }


  const refreshData = e => {
    gridApi?.showLoadingOverlay();
    fetch(
      "https://api.nasa.gov/planetary/apod?api_key=xE8H0ER9bxzelj6850UugbXcs5wi5cgEq1tZcvSv&count=10&thumbs=true"
    )
      .then(response => {
        if(response.ok){
          return response.json();
        }else{
          throw new Error("NASA API Issue");
        }
      })
      
      // update the data, rather than refresh
      .then(data => {
        if(gridApi){
          gridApi?.applyTransaction({
            add: data,
          })
        }else{
          // refresh all data
          var update= rowData.concat(data);     
          setRowData(update);
        }
        })
      .then(document.querySelectorAll('.piccount').forEach((element)=> element.innerText=""))
      .catch(error => {
              console.log(error);
              document.querySelectorAll('.piccount').forEach((element)=> element.innerText="Loading Error: Try Again");
              gridApi?.hideOverlay();
            })
      ;
  };

  const onColumnResized = (params) => {
    params.api.resetRowHeights();
  };


  // removed resizable until we make better react implementation to avoid flicker and resize artifacts
  const columnDefs = useMemo(
    () => [
      { field: 'date', width:120, sortable: true, resizable:false, cellRendererFramework: DateRenderer},
      {field: 'explanation', 
            autoHeight:true,
            wrapText:true,
            filter:"agTextColumnFilter",
            resizable:false,
            flex:"2",
            cellRendererFramework: TextRenderer
          },
      {field: "url", flex:1, headerName:"Image", cellRendererFramework: VideoImageRenderer}
    ],
    []
  );

  return (

    <div style={{ height: "100%", width: "100%" }}>
      <button onClick={refreshData}>Get More Pictures</button><span className="piccount"></span>
      <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
        <AgGridReact onGridReady={onGridReady} rowData={rowData}
          pagination={true}
          paginationPageSize={10}
          onColumnResized={onColumnResized}
          style={{ width: '100%', height: '100%;' }}
          reactUi={true}
          columnDefs={columnDefs}
        >
        </AgGridReact>
      </div>
      <div style={{textAlign:"right"}} >
      <span className="piccount"></span><button onClick={refreshData}>Get More Pictures</button>
      </div>
    </div>
  );
};

export default App;
