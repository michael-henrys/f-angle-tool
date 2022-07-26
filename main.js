function calculateRockFallVolume(formData) {
  const angle = formData.angle
  const height = formData.height
  const horizontalPGA = formData.horizontalPGA
  const surfaceArea = formData.surfaceArea
  vol_ln =(6.431*Math.log(angle))+(1.576*Math.log(height))+(0.526*Math.log(horizontalPGA))-37.122
  return Math.exp(vol_ln)*surfaceArea;
}