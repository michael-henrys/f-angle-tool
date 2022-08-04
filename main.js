//define model constants
const constants = {
  rockAvalanche: {
    '50': {coefficient: 4.78, exponent: -0.163147137}, 
    '16': {coefficient: 3.41, exponent: -0.163147137},
    '2': {coefficient: 2.43, exponent: -0.163147137},
  },
  dryDebris: {
    '50': {coefficient: 1.08, exponent: -0.033690259}, 
    '16': {coefficient: 0.90, exponent: -0.033690259},
    '2': {coefficient: 0.75, exponent: -0.033690259},
  },
  wetDebris: {
    '50': {coefficient: 0.85, exponent: -0.070562028}, 
    '16': {coefficient: 0.68, exponent: -0.070562028},
    '2': {coefficient: 0.55, exponent: -0.070562028},
  },
  debrisFlow: {
    '50': {coefficient: 0.82, exponent: -0.107498912},
    '16': {coefficient: 0.58, exponent: -0.107498912},
    '2': {coefficient: 0.41, exponent: -0.107498912},
  }
}


//show and hide the custom volume input
const volumeSelector = document.getElementById('volume')
const volumeInput = document.getElementById('customVolume')
volumeInput.style.display = 'none'
volumeSelector.addEventListener('change', function(e) {
  if (e.target.value === 'Other') {
    volumeInput.style.display = ''
  } else {
    volumeInput.style.display = 'none'
  }
})

//hide alert 
const alert = document.getElementById('alert')
alert.style.display = 'none'

//get form element and add event listener
const form = document.getElementById('calculatorInput')
form.addEventListener('submit', function(e) {
  e.preventDefault()
  update()
})


//get data from form
function getFormData() {
  const volume = form.elements.volume.value
  const customVolume = form.elements.customVolume.value
  return {
    type: form.elements.type.value,
    volume: volume === 'Other' ? customVolume : volume,
    POE: form.elements.POE.value,
  }
}

//update(render) the f angle
function update() {
  //get values from form
  const data = enforceVolumeBounds(getFormData())
  //calculate f angle
  const fAngle = calculateFAngle(data)
  //update f angle in the DOM
  console.log(fAngle)
  const fAngleDisplay = document.getElementById('fAngleOutput')
  fAngleDisplay.value = `${fAngle.toFixed(2)}`
}

//calculate f angle
function calculateFAngle(data) {
  if(!data) {
    return 'N/A'
  }
  const type = data.type
  const POE = data.POE
  const coefficient = constants[type][POE].coefficient
  const exponent = constants[type][POE].exponent
  return radToDeg(Math.atan(coefficient*Math.pow(POE, exponent)))
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
      }
      return null
    default:
      return data
  }
}

//function to convert radians into degrees
function radToDeg(rad) {
  return rad * 180 / Math.PI
}