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
  const formData = new FormData(e.target)
  const formDataObj = {};
  formData.forEach((value, key) => (formDataObj[key] = value))
  //calculate volume
  const volume = calculateRockFallVolume(formDataObj)
  //display volume
  const volumeOutput = document.getElementById('volumeOutput')
  volumeOutput.innerHTML = volume.toFixed(0) + ' m<sup>3</sup>'
})

