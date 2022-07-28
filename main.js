function calculateRockFallVolume(formData) {
  const angle = formData.angle
  const height = formData.height
  const horizontalPGA = formData.horizontalPGA
  const surfaceArea = formData.surfaceArea
  vol_ln =(6.431*Math.log(angle))+(1.576*Math.log(height))+(0.526*Math.log(horizontalPGA))-37.122
  return Math.exp(vol_ln)*surfaceArea;
}

const form = document.getElementById('calculatorInput')
form.addEventListener('submit', (e) => {
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
})

