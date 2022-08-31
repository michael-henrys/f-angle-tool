//define model constants
const constants = {
  rockAvalanche: {
    '50': {coefficient: 4.7786, exponent: -0.163147137}, 
    '16': {coefficient: 3.4085, exponent: -0.163147137},
    '2': {coefficient: 2.4312, exponent: -0.163147137},
  },
  dryDebris: {
    '50': {coefficient: 1.0795, exponent: -0.033690259}, 
    '16': {coefficient: 0.9026, exponent: -0.033690259},
    '2': {coefficient: 0.7547, exponent: -0.033690259},
  },
  wetDebris: {
    '50': {coefficient: 0.8467, exponent: -0.070562028}, 
    '16': {coefficient: 0.6807, exponent: -0.070562028},
    '2': {coefficient: 0.5472, exponent: -0.070562028},
  },
  debrisFlow: {
    '50': {coefficient: 0.8169, exponent: -0.107498912},
    '16': {coefficient: 0.5798, exponent: -0.107498912},
    '2': {coefficient: 0.4116, exponent: -0.107498912},
  }
}

//set up x values for graph lines
const xValues = []
for(let i = 0; i < 8; i++){
  let step = Math.pow(10, -1+i)
  for(let j = 0; j < 9; j++){
    value = (step+(j*step)).toFixed(1)
    xValues.push(value)
  }
}

//hide alert 
const alert = document.getElementById('alert')
alert.style.display = 'none'

//get form element and add event listener
const form = document.getElementById('calculatorInput')
form.addEventListener('submit', function(e) {
  e.preventDefault()
  update()
})

//show graph
updateGraph()

//get data from form
function getFormData() {
  return {
    type: form.elements.type.value,
    volume: form.elements.volume.value,
    POE: form.elements.POE.value,
  }
}

//update(render) the f angle
function update() {
  //get values from form
  const data = enforceVolumeBounds(getFormData())
  const fAngleDisplay = document.getElementById('fAngleOutput')
  if(!data) {
    fAngleDisplay.value = 'N/A'
  }else {
    //calculate f angle
    const type = data.type
    const volume = data.volume
    const POE = data.POE
    const fAngle = calculateFAngle(type, volume, POE)
    //update f angle in the DOM
    fAngleDisplay.value = `${fAngle.toFixed(2)}`
    //update graph
    updateGraph(data)
  }
}

//calculate f angle
function calculateFAngle(type, volume, POE) {
  const coefficient = constants[type][POE].coefficient
  const exponent = constants[type][POE].exponent
  return radToDeg(Math.atan(coefficient*Math.pow(volume, exponent)))
}

//enforce volume bounds for different landslide types
function enforceVolumeBounds(data) {
  //hide alert 
  const alert = document.getElementById('alert')
  alert.style.display = 'none'
  const type = data.type
  switch (type) {
    case 'dryDebris':
      if(data.volume > 100000) {
        //show warning
        alert.innerHTML = 'Dry Debris Avalanches with volumes greater than 100,000 cubic meters will use the Rock Avalanche Dataset'
        alert.style.display = ''
        //return the data with the type changed to Rock Avalanche
        return {
          ...data,
          type: 'rockAvalanche'
        }
      }
      return data
    case 'rockAvalanche':
      if(data.volume < 100000) {
        //show warning
        alert.innerHTML = 'Rock Avalanches with volumes less than 100,000 cubic meters will use the Dry Debris Avalanche Dataset'
        alert.style.display = ''
        //return the data with the type changed to Rock Avalanche
        return {
          ...data,
          type: 'dryDebris'
        }
      }
      return data
    case 'wetDebris':
      if(data.volume > 100000) {
        //show warning
        alert.innerHTML = 'F-Angle cannot be calculated for Wet Debris Avalanches with volumes greater than 100,000 cubic meters'
        alert.style.display = ''
        return null
      }
      return data
    case 'debrisFlow':
      if(data.volume > 1000000) {
        //show warning
        alert.innerHTML = 'F-Angle cannot be calculated for Debris Flow landslides with volumes greater than 1,000,000 cubic meters'
        alert.style.display = ''
        return null
      }
      return data
    default:
      return data
  }
}

//function to convert radians into degrees
function radToDeg(rad) {
  return rad * 180 / Math.PI
}

function updateGraph(formData){
  //set up trace for calculated f-angle point
  let data = []
  if(formData !== undefined) {
    const point = {
      x: [formData.volume],
      y: [calculateFAngle(formData.type, formData.volume, formData.POE)],
      mode: 'markers',
      type: 'scatter',
      name: 'Calculated F-Angle',
      marker: {
        color: '#ff0000',
        size: 12
      }
    }
  
    //set up trace for 50% POE line
    const y50 = xValues.map(x => calculateFAngle(formData.type, x, '50'))
    const POEline1 = {
      x: xValues,
      y: y50,
      type: 'scatter',
      mode: 'lines',
      name: '50% POE'
    }
  
    //set up trace for 16% POE line
    const y16 = xValues.map(x => calculateFAngle(formData.type, x, '16'))
    const POEline2 = {
      x: xValues,
      y: y16,
      type: 'scatter',
      mode: 'lines',
      name: '16% POE'
    }
  
    //set up trace for 2% POE line
    const y2 = xValues.map(x => calculateFAngle(formData.type, x, '2'))
    const POEline3 = {
      x: xValues,
      y: y2,
      type: 'scatter',
      mode: 'lines',
      name: '2% POE'
    }
    //collect traces to add to graph
    data = [POEline1, POEline2, POEline3, point]
  }

  //set up layout for graph
  const layout = {
    title: {
        text: 'F-angle',
        font: {size: 17},
        yanchor: 'top',
      },
    showlegend: true,
    legend: {
      orientation: 'h',
      y: -0.25
    },
    margin: {t: 50, l: 60, r: 60, pad: 0},
    xaxis: {
      title: {
        text: 'Landslide Volume (m<sup>3</sup>)',
        font: {size: 13},
      },
      type: 'log',
      range: [2, 7]
    },
    yaxis: {
      title: {
        text: 'F-Angle (degrees)',
        font: {size: 13},
        standoff: 15 
      },
      range: [0, 50]
    },
    autosize: true,
    height: 600
  }
  //define config for graph
  const config = {
    displayModeBar: false,
    responsive: true
  }

  //get graph element from DOM
  const graph = document.getElementById('graph')
  //plot graph
  Plotly.newPlot( graph, data, layout, config )
}