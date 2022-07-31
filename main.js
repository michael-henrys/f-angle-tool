const xValues = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15]

//set up form and add event listener for calculate button
const form = document.getElementById('calculatorInput')
form.addEventListener('submit', e => {
  e.preventDefault()
  update()
})

//initially update the volume and graph
update()

function calculateRockFallVolume(formData) {
  const angle = formData.angle
  const height = formData.height
  const horizontalPGA = formData.horizontalPGA
  const surfaceArea = formData.surfaceArea
  vol_ln =(6.431*Math.log(angle))+(1.576*Math.log(height))+(0.526*Math.log(horizontalPGA))-37.122
  return Math.exp(vol_ln)*surfaceArea;
}

// function calculateErosionRate(formData) {
//   const angle = formData.angle
//   const height = formData.height
//   const horizontalPGA = formData.horizontalPGA
//   vol_ln =(6.431*Math.log(angle))+(1.576*Math.log(height))+(0.526*Math.log(horizontalPGA))-37.122
//   return Math.exp(vol_ln)
// }

function update() {
  //get form data
  formData = getFormData()
  //calculate volume
  const volume = calculateRockFallVolume(formData)
  //display volume
  const volumeOutput = document.getElementById('volumeOutput')
  volumeOutput.innerHTML = volume.toFixed(0) + ' m<sup>3</sup>'
  //update Graph 
  updateGraph()
}

function getFormData(){
  return {
    angle: form.elements.angle.value,
    height: form.elements.height.value,
    horizontalPGA: form.elements.horizontalPGA.value,
    surfaceArea: form.elements.surfaceArea.value
  }
}

function updateGraph(){
  //get form data
  graph = document.getElementById('graph');
  //calculate yValues for line based on range of Xvalues
  const yValues = xValues.map(x => calculateRockFallVolume({ ...getFormData(), horizontalPGA: x }))
  //create line trace
  const trace1 = {
    x: xValues, 
    y: yValues,
    mode: 'lines'
  }

  // calculate uncertainty for line of 10% of volume
  const yValuesUncertaintyTop = yValues.map(y => y + y*0.1)
  const yValuesUncertaintyBottom = yValues.map(y => y - y*0.1)
  const yValuesUncertainty = yValuesUncertaintyTop.concat(yValuesUncertaintyBottom.reverse())
  const xValuesUncertainty = xValues.concat(xValues.slice().reverse())

  // create trace for uncertainty
  var trace2 = {
    x: xValuesUncertainty,
    y: yValuesUncertainty,
    fill: "toself", 
    fillcolor: "rgba(0,100,80,0.2)", 
    line: {color: "transparent"}, 
    showlegend: false, 
    type: "scatter"
  }
  
  //get point coordinates
  const pointX = form.elements.horizontalPGA.value
  const pointY  = calculateRockFallVolume(getFormData())

  //calculate uncertainty of 10% for point
  const pointUncertainty = pointY*0.1

  //create point trace
  const trace3 = {
    x: [pointX],
    y: [pointY],
    error_y: {
      type: 'data',
      array: [pointUncertainty],
      visible: true
    },
    mode: 'markers',
  }
  
  //create data array
  const data = [trace1, trace2, trace3]

  //define layout
  const layout = { 
    title: {
      text: 'Rock Fall Volume over the range of <br>Horizontal PGA values',
      font: {size: 15}
    },
    showlegend: false,
    margin: {t: 60, l: 70, r: 60, pad: 4},
    yaxis: {
      title: 'Rockfall Volume (m<sup>3</sup>)',
      rangemode: 'tozero'
    },
    xaxis: {
      title: 'Horizontal PGA (m/s<sup>2</sup>)',
      rangemode: 'tozero'
    }
  } 

  //define layout
  const config = {
    displayModeBar: false,
    responsive: true
  }

  //plot graph
  Plotly.newPlot( graph, data, layout, config )
}
