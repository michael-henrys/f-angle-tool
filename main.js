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
  //get values from form
  const data = enforceVolumeBounds(getFormData())
  console.log(data)
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

//enforce volume bounds for different landslide types
function enforceVolumeBounds(data) {
  //hide alert 
  const alert = document.getElementById('alert')
  alert.style.display = 'none'
  const type = data.type
  switch (type) {
    case 'Debris Avalanche dry':
      if(data.volume > 100000) {
        //show warning
        alert.innerHTML = 'Dry Debris Avalanches with volumes greater than 100,000 cubic meters will use the Rock Avalanche Dataset'
        alert.style.display = ''
        //return the data with the type changed to Rock Avalanche
        return {
          ...data,
          type: 'Rock Avalanche'
        }
      }
      return data
    case 'Rock Avalanche':
      if(data.volume < 100000) {
        //show warning
        alert.innerHTML = 'Rock Avalanches with volumes less than 100,000 cubic meters will use the Dry Debris Avalanche Dataset'
        alert.style.display = ''
        //return the data with the type changed to Rock Avalanche
        return {
          ...data,
          type: 'Debris Avalanche dry'
        }
      }
      return data
    case 'Debris Avalanche wet':
      if(data.volume > 100000) {
        //show warning
        alert.innerHTML = 'F-Angle cannot be calculated for Wet Debris Avalanches with volumes greater than 100,000 cubic meters'
        alert.style.display = ''
      }
      return data
    case 'Debris Flow':
      if(data.volume > 1000000) {
        //show warning
        alert.innerHTML = 'F-Angle cannot be calculated for Debris Flow landslides with volumes greater than 1,000,000 cubic meters'
        alert.style.display = ''
      }
      return data
    default:
      return data
  }
}