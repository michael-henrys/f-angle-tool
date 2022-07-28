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
  graph = document.getElementById('graph');
  const yValues = xValues.map(x => calculateRockFallVolume({ ...getFormData(), horizontalPGA: x }))
  const trace1 = {
    x: xValues, 
    y: yValues,
    mode: 'lines'
  }

  const trace2 = {
    x: [form.elements.horizontalPGA.value],
    y: [calculateRockFallVolume(getFormData())],
    mode: 'markers',
  }
  
  const data = [trace1, trace2]

  const layout = { 
    title: 'Rock Fall Volume for a range of Horizontal PGA values',
    showlegend: false,
    margin: {t: 40, l: 60, r: 30, pad: 4},
    yaxis: {
      title: 'Rockfall Volume (m<sup>3</sup>)',
      rangemode: 'tozero'
    },
    xaxis: {
      title: 'Horizontal PGA (m/s<sup>2</sup>)',
      rangemode: 'tozero'
    }
  } 

  const config = {
    displayModeBar: false,
    responsive: true
  }

  Plotly.newPlot( graph, data, layout, config )
}
