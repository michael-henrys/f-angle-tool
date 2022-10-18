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

//set volume classes
let volumeClasses = []
for(let i = 0; i < 8; i++){
  let step = Math.pow(10, -1+i)
  for(let j = 0; j < 9; j++){
    value = (step+(j*step)).toFixed(1)
    volumeClasses.push(value)
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
    volume: form.elements.volume1.value * form.elements.volume2.value,
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
    updateGraph()
  }else {
    //calculate f angle
    const type = data.type
    const volume = data.volume
    const POE = data.POE
    console.log(volume)
    const fAngle = calculateFAngle(type, volume, POE)
    //update f angle in the DOM
    fAngleDisplay.innerHTML = `${fAngle.toFixed(2)}°`
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
        //Change the type on the form to Rock Avalanche
        form.elements.type.value = 'rockAvalanche'
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
        //Change the type on the form to Dry Debris Avalanche
        form.elements.type.value = 'dryDebris'
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
      //show caveat for debris flow
      alert.innerHTML = 'For debris flows, entrainment along runout path can substantially alter runout distance. <br> F-Angle output should be used in conjunction with geomorphic evidence (e.g. debris fan extent), and not supersede it.'
      alert.style.display = ''
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
  let data = []
  if(formData !== undefined) {
    //set up trace for calculated f-angle point
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

    //plot real data 
    const realData = {
      dryDebris: {
        volume: [47,56,61,138,152,173,213,215,228,321,350,367,422,442,611,681,957,1058,1095,1237,1353,1659,2533,3129,3435,6376,6837,8400,9486,14984,568,671,675,771,1067,1118,1132,1295,1368,1649,2486,2632,3039,3689,4220,4780,5073,7049,7970,9195,9296,12193,16364,17247,19292,38029,41784,45607,75524,84862,96,118,274,1277,180,1124,544,374,5356,2069,4156,2544,2236,3174,1195,3393,10085,2082,2777,6953,15361,1698,5713,3709,15183,14687,4520,7956,12335,43833,10382,7774,28328,81220,84357,89047,207343,142,114,1644,2868,4858,3277,456,826,188.5,315,237,4793,1072,575,29,39.5,947,780,366,1105,316,1167,198,1129,1903,30.5,25,74,118,147,1298,197,500,1200,551,4700,2300,60,900,25600,25600,530,4437,200,500,600,360,376,116],
        fAngle: [46,41,37,35,44,42,38,39,40,37,40,43,46,52,42,41,46,39,35,36,35,40,43,42,43,37,39,40,40,42,32,30,37,40,36,42,37,43,35,42,51,39,37,45,41,36,46,34,40,44,43,39,36,39,44,41,40,30,34,37,55,37,40,38,40,42,38,34,38,40,43,39,42,40,39,41,41,37,38,40,41,33,39,40,38,41,42,34,31,42,45,33,39,27,26,37,36,51,35,32,36,41,41,41,38,39,31,39,41,43,39,44,53,37,40,47,45,39,37,42,34,46,46,51,53,39,49,34,43,32,36,41,39,41,42,39,44,43,51,37,47,51,56,40,36,49],
        source: ["Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Massey, et al . 2012","Massey, et al . 2012","Massey, et al . 2012","Massey, et al . 2012","Massey, et al . 2012","Massey, et al . 2012","Massey, et al . 2012","Massey, et al . 2012","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","Brideau et al., 2020",""] 
      },
      wetDebris: {
        volume: [21,37,41,44,50,72,85,89,101,102,110,116,149,157,173,227,249,266,287,307,391,565,594,634,761,821,905,918,1046,1319,1338,1679,1794,2582,2876,3402,5902,6975,26509,2,2,3,4,4,5,5,5,6,6,6,7,8,9,10,12,12,14,14,16,18,18,18,22,24,25,27,32,35,39,40,40,42,42,43,44,47,47,54,57,57,58,63,63,65,68,69,70,70,76,80,81,83,90,95,98,124,127,165,414,45,50,50,70,70,100,140,140,170,320,35,225,210,250,200,150,70,33,391,731,183,27,80,116,183,265,265,370,370,392,405,406,428,446,487,577,600,604,621,624,666,1029,1216,1242,1377,1536,1722,1834,2080,2200,2300,2334,2353,2494,2620,3055,4318,9190,631,1960,410,1000,110,260,4870,9400,3300,3300,4100,4200,2600],
        fAngle: [27,36,31,32,33,35,31,30,42,37,37,30,33,40,21,29,25,36,35,26,35,34,21,36,21,34,30,19,30,35,26,34,32,19,28,26,20,25,18,41,42,35,37,36,32,31,38,28,31,38,36,40,38,29,32,40,29,34,40,34,36,40,36,45,33,37,30,37,41,38,26,31,30,25,32,29,39,29,43,30,30,24,34,28,29,33,37,41,38,30,31,37,33,31,27,28,33,33,32,34,28,41,27,37,39,37,29,32,36,36,32,26,25,36,19,47,32,29,35,28,31,43,24,31,20,25,31,30,28,31,31,23,23,26,32,24,19,22,30,35,30,33,23,23,20,23,31,26,24,22,20,29,26,23,24,24,17,35,37,37,18,26,38,39,19,30,29,32,26,25],
        source: ["Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Hunter, G., Fell, R., 2003","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N. Ko F.W.Y., Hui T.H.H. 2004","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Wong H.N., Lam K.C., Ho, K.K.S. 1998","Hunter and Fell, 2001","Hunter and Fell, 2001","Hunter and Fell, 2001","Hunter and Fell, 2001","Hunter and Fell, 2001","Hunter and Fell, 2001","Hunter and Fell, 2001","Hunter and Fell, 2001","Milne et al. 2015","Milne et al. 2015","Milne et al. 2015","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2019","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020"] 
      },
      debrisFlow: {
        volume: [200,30,3550,50,493,208,272,1544,1134,1000,925,320,1200,10870,2170,5897,757,1091,2999,2350,883,1328,570,336,638,2606,195000,2010,1740,1290,10590,128900,1200,1100,130000,170,80,150,3000,13000,900,1000,450,1500,1500,50,1700,15200,9900,7600,2400,530,1000,5400,17000,500000,460,11500,14600,80000,90000,24000,22000,45000,50000,90000,60000,2000,59,90,1530,20,8500,3200,15000,10600,46800,11000,5200,2100,10000,200,1230,370,1500,9300,11000,3200,150,300,1500,60,1200,100000,30000,10000,40000,25000],
        fAngle: [27,31,22,31,27,27,17,18,15,22,21,19,18,18,20,21,19,29,23,33,27,26,18,30,26,21,10,10,13,24,22,19,30,15,6,18,29,29,22,23,44,21,19,22,18,21,11,11,13,16,19,18,18,7,21,6,16,9,11,19,18,21,17,17,13,12,24,27,26,29,29,34,24,22,20,18,20,22,21,27,20,27,21,25,23,15,23,29,34,28,29,26,19,17,17,20,23,11],
        source: ["Massey, et al. 2014","Massey, et al. 2014","Massey, et al. 2014","Massey, et al. 2014","Massey, et al. 2014","Massey, et al. 2014","Massey, et al. 2014","Massey, et al. 2014","Massey, et al. 2014","Harvey J. 2011","Harvey J. 2011","Harvey J. 2011","Harvey J. 2011","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Kailey P. 2012","Pierson TC. Debris flows. Rev. 1980","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Brideau et al., 2020","Hunter and Fell, 2003","Hunter and Fell, 2003","Hunter and Fell, 2003","Hunter and Fell, 2003","Hunter and Fell, 2003","Hunter and Fell, 2003","Hunter and Fell, 2003","Hunter and Fell, 2003","Ayotte, D., and Hungr, O. 1998","Ayotte, D., and Hungr, O. 1998","Ayotte, D., and Hungr, O. 1998","McDonald GN, Giraud RE (2002","McDonald GN, Giraud RE (2002","McDonald GN, Giraud RE (2002","McDonald GN, Giraud RE (2002","McDonald GN, Giraud RE (2002","McDonald GN, Giraud RE (2002","Cannon et al., 1998","Campbell, 1975","Curry, R.R., 1966","Johnson,  A.M.,  1984","De Graff, 1997","Meyer and Wells 1997","Meyer et al., 2001","Jackson et al., 1989","Jackson et al., 1989","Jackson et al., 1989","Nasmith and Mercer.1979","Nasmith and Mercer.1979","Couture, R. and S.G. Evans, 2001","Jakob et al., 2011","Bartle et al. 1997","Devoli et al., 2009","Milne et al. 2015","Milne et al. 2015","Milne et al. 2015","Milne et al. 2015","Milne et al. 2015","Milne et al. 2015","D'Agostino et al. 2009","D'Agostino et al. 2009","D'Agostino et al. 2009","D'Agostino et al. 2009","D'Agostino et al. 2009","D'Agostino et al. 2009","Rapp, A., & Nyberg, R. (1981","Fannin et al., 2015","Corominas, 1996","Corominas, 1996","Corominas, 1996","Corominas, 1996","Corominas, 1996","Corominas, 1996","Corominas, 1996","Corominas, 1996","Corominas, 1996","Corominas, 1996","Corominas, 1996","Chiarlet et al., 2007","Chiarlet et al., 2007","Chiarlet et al., 2007","Chiarlet et al., 2007","Chiarlet et al., 2007"] 
      }, 
      rockAvalanche: {
        volume: [75000000,225000,10000000,2750000,750000,650000,400000,9000000,40000000,125000000,500000,2275000,8000000,5000000,2500000,375000,20000000,2500000,13500000,15000000,3500000,3750000,15000000,19500000,750000,15000000,510913,2462080,432000,144000,24950,87702,85386,1491930,66776,1742410,115639,591261,109899,63324,20041,20845,236092,615553,149158,349045,35618,145298,20263,225682,11523,25643,65613,17063,45161,38058,41603,32207,31354,21082,26155,21603,65194,30513,125835,41696,237388,20286,16338,401055,288478,34607,33090,12635,397025,95333,11225,99616,30430,31065,181139,108760,61460,39602,39602,78657,173555,366489,886981,40492,38569,141629,1100560,236427,184334,91972,137748,277887,40942,17339,22500,289594,17461,21548,29333,194994,101328,75591,184334,685140,118228,82771,276790,63565,118048,201898,27832,480119,19334,3047810,1076980,99791,19613,38075,39139,32433,19556,43883,75942,233054,593198,1181990,3605210,118528,11013,17468,72785,176114,27841,31510,95783,92798,127023,183655,159274,35437,27627,18629,12461,13159,19999,61163,10107,28691,14608,37057,24151,14308,147890,209543,26133,32338,16041,186879,60790,38467,77458,15229,11244,12928,12701,54950,118134,47897,2116400,103249,13774,75579,12698,17384,19531,60679,185467,125100,188857,34062,20857,32084,70362,501919,8591140,520506,310366,13134,59465,45691,496363,391445,105284,57264,4000000,7400000,1000000,1040000,5000000,48500000,4000000,1000000,1600000,3000000,25000000,60000000,40000000,2000000,500000,22000000,6000000,45000000,10000000,30000000,4130000,4820000,5400000,10200000,498000000,86000000,39100000,36500000,4500000,120000,735000,30000000,40000000,20000000,450000000,45000000,5000000,5000000,3100000,2100000,2500000,980000,45000000,740000,5000000,48000000,1800000,3100000,75000000,150000,1000000,50000,900000,4000000,1000000,22500000,10400000,750000000,45000000,12500000,10000000,2500000000,29000000000,900000000,1500000000,27000000000,700000000,11000000,18000000,18100000,10500000,8200000,2400000,4400000,3000000,15000000,4200000,3600000,5600000,3200000,2800000,2300000,4800000,3400000,3000000,22000000,2200000,2000000,1700000,2100000,2400000,4700000,1400000,3100000,3700000,1700000,1200000,1600000,1700000,1000000,1100000,3500000,1200000,2000000,1200000,1900000,1500000,3600000,20000000000,12000000000,2750000000,1500000000,1300000000,1000000000,800000000,280000000,250000000,250000000,220000000,150000000,140000000,120000000,80000000,50000000,38000000,35000000,30000000,30000000,29000000,20000000,15000000,11000000,10500000,5500000,2500000,650000,500000,500000,30000,2000000,130000,610000,10500000,100000,150000,400000,250000,400000,200000,6000000,8000000,12000000,13000000,14000000,15000000,16000000,16000000,17500000,20000000,20000000,20000000,21000000,25000000,29500000,30000000,30000000,30000000,40000000,40000000,50000000,50000000,56500000,68000000,80000000,80000000,100000000,100000000,100000000,115000000,120000000,150000000,150000000,170000000,170000000,180000000,210000000,250000000,360000000,400000000,400000000,400000000,469000000,550000000,600000000,600000000,2000000000,2100000000,50000000,19960000,16330000,15000000,13410000,12000000,7810000,7500000,5360000,5340000,4680000,4500000,4000000,3150000,2840000,2740000,2570000,2480000,2385500,1920000,1640000,1540000,1470000,1390000,1290000,920000,920000,860000,860000,820000,820000,700000,620000,570000,560000,540000,520000,400000,823000,9000000,67000000,7500000,30000,47000000,6620000,600000000,3981072,34000000,18000000,20000000,23000000,26000000,27000000,150000,100000,300000,5000000,20000000,30000000,600000000,800000000,800000,150000000,500000,190000000,900000,15000000,54500000,1800000,4500000,15300000,41000000,2400000,1490000,2190000,286000000],
        fAngle: [14,36,25,23,31,43,31,23,18,13,52,26,28,29,30,33,21,31,30,16,24,24,21,19,24,23,29,27,34,34,46,37,38,25,33,24,33,25,38,43,43,41,45,45,43,37,35,41,39,36,35,41,43,46,49,44,45,48,39,33,39,36,39,37,36,46,41,33,33,39,37,38,41,36,37,36,38,41,39,35,30,33,41,40,46,42,37,37,41,49,45,44,35,42,35,38,38,42,39,50,39,37,42,50,41,40,43,40,33,33,38,47,42,38,34,40,36,39,39,34,35,37,49,44,42,47,44,36,41,37,38,33,27,44,51,45,42,36,41,53,38,46,33,44,45,40,43,39,44,39,32,45,38,33,40,44,47,44,37,39,42,36,41,46,39,49,45,37,40,41,42,41,43,44,32,51,52,47,36,37,50,35,44,39,38,42,49,34,38,50,21,42,36,54,33,39,38,41,40,38,22,16,20,14,18,10,16,13,10,11,14,13,16,14,17,14,15,19,14,20,18,14,15,20,9,15,12,15,18,31,14,10,10,5,8,10,10,11,11,16,10,15,16,19,21,24,12,12,12,20,18,39,24,14,22,18,16,7,12,31,11,5,11,6,3,10,17,30,17,11,22,13,23,26,24,21,16,16,19,21,33,19,28,32,19,10,25,31,14,29,18,20,36,21,20,20,46,21,42,30,42,29,25,24,27,39,26,24,5,7,12,13,8,6,5,14,7,19,7,20,11,20,14,19,10,11,18,11,15,18,20,16,15,23,24,24,30,33,41,25,41,35,16,42,17,45,35,17,27,19,31,19,21,27,29,19,26,17,22,27,19,25,9,19,23,15,17,13,14,23,15,11,19,17,15,22,18,14,20,15,12,12,13,15,15,9,14,14,15,13,11,17,13,10,12,6,10,18,23,25,15,21,19,35,17,23,23,28,20,24,22,23,35,27,26,30,28,33,22,18,18,30,28,22,24,28,26,24,22,22,34,22,23,30,22,19,12,12,25,37,10,25,13,13,19,15,10,10,18,14,20,42,13,16,10,9,6,14,25,20,21,6,12,12,8,13,19,10,13,15,20,53,19],
        source: ["Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Hermanns et al., 2012","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Kolstad, 2021","Sakals et al., 2012","Brideau et al., 2012","Boultbee et al., 2006","Geertsema et al., 2006","Lu et al., 2003","Guthrie et al., 2012","Begueria et al., 2009","Geertsema et al., 2006","Geertsema et al., 2006","Blais-Stevens, A., et al., 2015","Moore and Matthews, 1978","Levson et al., 2003","Nichol et al., 2002","Brideau et al., 2010","Brideau et al., 2019","Huscroft et al., 2004","Evans et al., 1987","Couture, R. 1998","Couture, R. 1998","Cruden and Eaton, 1987","Cruden, 1976","Cruden, 1976","Cruden, 1976","Cruden, 1976","Cruden, 1976","Cruden, 1976","Cruden, 1976","Cruden, 1976","Cruden, 1982","Hungr and Evans, 2004","Hungr and Evans, 2004","Eisbacher, G.H., 1977","Eisbacher, G.H., 1977","Eisbacher, G.H., 1977","Eisbacher, G.H., 1977","Eisbacher, G.H., 1977","Eisbacher, G.H., 1977","Eisbacher, G.H., 1977","Jackson and Isobe, 1990","Jackson and Isobe, 1990","Jackson and Isobe, 1990","Jackson and Isobe, 1990","Ryder et al., 1990","Friele and Clague, 2004","Clague and Southers, 1982","Hsu, 1975","Friele et al., 2020","Friele et al., 2020","McColl, 2020","Hancox and Thomson, 2013","Hancox and Thomson, 2013","Hancox et al, 2010","Cox et al., 2015","Carey et al., 2015","Carey et al., 2015","McColl and Davies 2011","Lee et al. 2009","Barth, 2014","Barth, 2014","Hancox et al., 2005","Smith et al., 2006","Beetham et al., 2002","Beetham et al., 2002","Beetham et al., 2002","Beetham et al., 2002","Hancox and Perrin 2009","Hancox and Perrin 2009","Massey et al. 2013","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Hancox et al., 2016","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Scheidegger, 1973","Locat et al., 2006","Locat et al., 2006","Locat et al., 2006","Sanders et al., 2021","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Li, T., 1983","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Zhan W. Fan X. Huang R. Pei X. Xu Q. Li W. 2017","Fan et al., 2019","Ren et al., 2018","Zeng et al., 2019","Zeng et al., 2018","Zhou et al. 2020","Zeng et al. 2020","Lai et al. 2021","von Wartburg et al. 2020","Corominas, 1996","Govi et al., 2002","Porter SC, Orombelli G. 1980","Post, 1967","Post, 1967","Post, 1967","Post, 1967","Alean, 1984","Govi, M., and P. F. Sorzana (1977","Jibson, 1992","Sassa, 1988","D'Elia et al. 1985","D'Elia et al. 1985","Legros, 2002","Legros, 2002","Legros, 2002","Legros, 2002","Cancelli & Scezi, 1987","Palmer, L. 1977","Wyrwoll, 1986","Panet, 2010","Coe et al., 2018","Pedersen et al. 2020","Pedersen et al. 2020","Pedersen et al. 2020","Pedersen et al. 2020","Pedersen et al. 2020","Pedersen et al. 2020","Stock and Uhrhammer, 2010","Castleton et al. 2016"]
      }, 
      
    }

    //set up trace for real data points
    const realDataTrace = {
      x: realData[formData.type].volume,
      y: realData[formData.type].fAngle,
      mode: 'markers',
      type: 'scatter',
      name: 'Real Data',
      hovertext: realData[formData.type].source,
      marker: {
        color: 'lightgrey',
      }
    }

    //fix xValues to make sure it is the correct range for the landslide type
    switch (formData.type) {
      case 'dryDebris':
        xValues = volumeClasses.filter(x => x <= 100000 && x >= 100)
        break
      case 'rockAvalanche':
        xValues = volumeClasses.filter(x => x >= 100000)
        break
      case 'wetDebris':
        xValues = volumeClasses.filter(x => x <= 100000 && x >= 100)
        break
      case 'debrisFlow':
        xValues = volumeClasses.filter(x => x <= 1000000 && x >= 100)
        break
      default:
        break    
    }
  
    //set up trace for 50% POE line
    const y50 = xValues.map(x => calculateFAngle(formData.type, x, '50'))
    const POEline1 = {
      x: xValues,
      y: y50,
      type: 'scatter',
      mode: 'lines',
      name: '50% POE',
      line: {
        width: 3
      }
    }

    //set up trace for out of bounds 50% POE line 
    const y50Grey = volumeClasses.map(x => calculateFAngle(formData.type, x, '50'))
    const greyLine1 = {
      x: volumeClasses,
      y: y50Grey,
      type: 'scatter',
      mode: 'lines',
      hovertext: 'The F-Angle is undefined for this Volume',
      showlegend: false,
      line: {
        width: 1,
        color: 'black',
        dash: 'dot'
      }
    }
  
    //set up trace for 16% POE line
    const y16 = xValues.map(x => calculateFAngle(formData.type, x, '16'))
    const POEline2 = {
      x: xValues,
      y: y16,
      type: 'scatter',
      mode: 'lines',
      name: '16% POE',
      line: {
        width: 3
      }
    }

    //set up trace for out of bounds 16% POE line 
    const y16Grey = volumeClasses.map(x => calculateFAngle(formData.type, x, '16'))
    const greyLine2 = {
      x: volumeClasses,
      y: y16Grey,
      type: 'scatter',
      mode: 'lines',
      hovertext: 'The F-Angle is undefined for this Volume',
      showlegend: false,
      line: {
        width: 1,
        color: 'black',
        dash: 'dot'
      }
    }
  
  
    //set up trace for 2% POE line
    const y2 = xValues.map(x => calculateFAngle(formData.type, x, '2'))
    const POEline3 = {
      x: xValues,
      y: y2,
      type: 'scatter',
      mode: 'lines',
      name: '2% POE',
      line: {
        width: 3
      }
    }

    //set up trace for out of bounds 2% POE line 
    const y2Grey = volumeClasses.map(x => calculateFAngle(formData.type, x, '2'))
    const greyLine3 = {
      x: volumeClasses,
      y: y2Grey,
      type: 'scatter',
      mode: 'lines',
      hovertext: 'The F-Angle is undefined for this Volume',
      showlegend: false,
      line: {
        width: 1,
        color: 'black',
        dash: 'dot'
      }
    }
  
    //collect traces to add to graph
    data = [greyLine1, greyLine2, greyLine3, realDataTrace, POEline1, POEline2, POEline3, point]
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
      x: 1.4,
      xanchor: 'right',
      y: 1
    },
    margin: {t: 50, l: 60, r: 60, pad: 0},
    xaxis: {
      title: {
        text: 'Landslide Volume (m<sup>3</sup>)',
        font: {size: 13},
      },
      type: 'log',
      range: [0.01, 7],
      fixedrange: true
    },
    yaxis: {
      title: {
        text: 'F-Angle (degrees)',
        font: {size: 13},
        standoff: 15 
      },
      range: [0, 50],
      fixedrange: true
    },
    autosize: true,
    height: 600
  }
  //define config for graph
  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d'],
    responsive: true,
    toImageButtonOptions: {
      format: 'png', // one of png, svg, jpeg, webp
      filename: 'f-angle-plot',    
    },
  }

  //get graph element from DOM
  const graph = document.getElementById('graph')
  //plot graph
  Plotly.newPlot( graph, data, layout, config )
}

