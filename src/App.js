import React, { useState, useEffect, useMemo, useCallback} from "react";
import { render } from "react-dom";
import { AgGridColumn, AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

const VideoImageRenderer = props => {

  // set image to size with the row when loading
  const[imageStyle, setImageStyle] = useState({height:props.node.rowHeight + 'px', width:'auto'});
  const[mediaDisplay, setMediaDisplay] = useState();
  

  const setImageToFillCell = ()=>{
    setImageStyle({height:'100%', width:'auto'});
  }

  useEffect(()=>{
    switch(props.node.data.media_type) {
      case "image":
        setMediaDisplay({href: props.value, imgSrc: props.value, mediaType:"image", alt: props.node.data.title, title: undefined});
        break;
      case "video":
        setMediaDisplay({href: props.value, imgSrc: props.node.data.thumbnail_url, mediaType:"video", alt:props.node.data.title, title: "Watch Video Now"});
        break;
      default:
        setMediaDisplay({href: undefined, imgSrc: undefined, mediaType:"other", alt: undefined, title: props.node.data.media_type});
        break;
    }

  },[props.node.data.media_type]);

  if(mediaDisplay===undefined)
    return null;

    return (

      <a href={mediaDisplay.href} target='_blank' rel="noreferrer">
        {mediaDisplay.title && <p>{mediaDisplay.title}</p>}
        {mediaDisplay.imgSrc &&
          <img style={imageStyle} src={mediaDisplay.imgSrc} loading='lazy' alt={mediaDisplay.alt} onLoad={setImageToFillCell}/>
        }
      </a>  
    )

};

const DateRenderer= (props) => {

      const mydateVals = props.value.split("-");
      var myurl = "https://apod.nasa.gov/apod/ap" + mydateVals[0].substr(-2, 2) + mydateVals[1] + mydateVals[2] + ".html";

      return (
        <a href={myurl} target='_blank' rel='noreferrer'>{props.value}</a>
      );
};


const App = () => {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const [rowData, setRowData] = useState(); // defaulting to [] would remove the loading overlay

  const refreshData = () => {
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
          // refresh all data and handle initial undefined state
          var update= rowData ? rowData.concat(data) : [].concat(data);     
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

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    // load data from api when grid first rendered
    refreshData();
  }

    
  const onColumnResized = (params) => {
    //params.api.resetRowHeights();
  };


  const columnDefs = useMemo(
    () => [
      { field: 'date', width:120, sortable: true, resizable:false, cellRendererFramework: DateRenderer},
      {field: 'explanation', 
            autoHeight:true,
            wrapText:true,
            filter:"agTextColumnFilter",
            resizable:true,
            flex:"2",
            //cellRendererFramework: TextRenderer
            // rather than a renderer, just set the styles and let the grid do the work
            cellStyle: {wordBreak: "normal", lineHeight: "1.5em"}
          },
      {field: "url", flex:1, headerName:"Image", autoHeight:false, cellRendererFramework: VideoImageRenderer}
    ],
    []
  );

  return (

    <div style={{ height: "100%", width: "100%" }}>
      <button onClick={refreshData}>Get More Pictures</button><span className="piccount"></span>
      <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
        <AgGridReact onGridReady={onGridReady}
         rowData={rowData}
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
