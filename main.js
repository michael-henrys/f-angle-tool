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
    const fAngle = calculateFAngle(data)
    //update f angle in the DOM
    fAngleDisplay.value = `${fAngle.toFixed(2)}`
  }
}

//calculate f angle
function calculateFAngle(data) {
  const type = data.type
  const volume = data.volume
  const POE = data.POE
  const coefficient = constants[type][POE].coefficient
  const exponent = constants[type][POE].exponent
  console.log(coefficient*Math.pow(volume, exponent))
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