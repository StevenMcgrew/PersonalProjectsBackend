let validCarMakes = ['Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley',
    'BMW', 'Bugatti', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
    'Citroen', 'Daewoo', 'Daihatsu', 'Dodge', 'Eagle', 'Ferrari',
    'Fiat', 'Ford', 'Freightliner', 'Geo', 'GMC', 'Honda', 'Hummer',
    'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini',
    'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Maybach',
    'Mazda', 'Mercedes-Benz', 'Mercury', 'MINI', 'Mitsubishi', 'Nissan',
    'Oldsmobile', 'Opel', 'Plymouth', 'Pontiac', 'Porsche', 'Ram',
    'Renault', 'Rolls Royce', 'Rover', 'Saab', 'Saturn', 'Scion', 'Seat',
    'Skoda', 'Smart', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo']

exports.isObjEmpty = (obj) => {
    return Object.keys(obj).length === 0
}

exports.strToPositiveInt = (str) => {
    if (!str) { return NaN }
    let int = Math.abs(parseInt(str, 10))
    if (isNaN(int)) { return NaN }
    return int
}

exports.isYearValid = (year) => {
    if (year.length !== 4) { return false }
    return this.isStringAnInteger(year)
}

exports.isMakeValid = (make) => {
    return validCarMakes.includes(make)
}

exports.isModelValid = (model) => {
    if (model.length > 40 || model.length < 1) { return false }
    return true
}

exports.isEngineValid = (engine) => {
    if (engine.length > 5 || engine.length < 4) { return false }
    if (!engine.includes('.')) { return false }
    if (!engine.includes('L')) { return false }
    return true
}

exports.isConditionValid = (condition) => {
    let validConditions = ['Good', 'Bad', 'Unsure']
    return validConditions.includes(condition)
}

exports.isCommentsValid = (comments) => {
    if (comments.length > 300) { return false }
    return true
}

exports.isMafUnitsValid = (mafUnits) => {
    let validUnits = ['g/s', 'kg/h']
    return validUnits.includes(mafUnits)
}

exports.isTempUnitsValid = (tempUnits) => {
    let validUnits = ['°F', '°C']
    return validUnits.includes(tempUnits)
}

exports.isElevationUnitsValid = (elevationUnits) => {
    let validUnits = ['ft', 'm']
    return validUnits.includes(elevationUnits)
}

exports.isStringAnInteger = (string) => {
    return [...string].every(char => '0123456789'.includes(char))
}