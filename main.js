function calculateRockFallVolume(formData) {
  const angle = formData.angle
  const height = formData.height
  const horizontalPGA = formData.horizontalPGA
  const surfaceArea = formData.surfaceArea
  vol_ln =(6.431*Math.log(angle))+(1.576*Math.log(height))+(0.526*Math.log(horizontalPGA))-37.122
  return Math.exp(vol_ln)*surfaceArea;
}

function handleCalculate(e) {
  e.preventDefault()
  //get form data
  const formData = {
    angle: e.target.elements.angle.value,
    height: e.target.elements.height.value,
    horizontalPGA: e.target.elements.horizontalPGA.value,
    surfaceArea: e.target.elements.surfaceArea.value
  }
  //calculate volume
  const volume = calculateRockFallVolume(formData)
  //display volume
  const volumeOutput = document.getElementById('volumeOutput')
  volumeOutput.innerHTML = volume.toFixed(0) + ' m<sup>3</sup>'
}

const form = document.getElementById('calculatorInput')
form.addEventListener('submit', handleCalculate)

graph = document.getElementById('graph');
const data = [{
	x: [1, 2, 3, 4, 5],
	y: [1, 2, 4, 8, 16] }]

const layout = { 
  margin: {t: 10, l: 30, r: 30, pad: 4}
} 

const config = {
  displayModeBar: false,
  responsive: true
}

Plotly.newPlot( graph, data, layout, config )
