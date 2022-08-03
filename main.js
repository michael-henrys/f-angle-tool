//show and hide the custom volume input
const volumeSelector = document.getElementById('volume')
volumeSelector.addEventListener('change', function(e) {
  const volumeInput = document.getElementById('custom-volume')
  if (e.target.value === 'Other') {
    volumeInput.style.display = ''
  } else {
    volumeInput.style.display = 'none'
  }
})