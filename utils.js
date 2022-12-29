const validCarMakes = ['Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley',
    'BMW', 'Bugatti', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
    'Citroen', 'Daewoo', 'Daihatsu', 'Dodge', 'Eagle', 'Ferrari',
    'Fiat', 'Ford', 'Freightliner', 'Geo', 'GMC', 'Honda', 'Hummer',
    'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini',
    'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Maybach',
    'Mazda', 'Mercedes-Benz', 'Mercury', 'MINI', 'Mitsubishi', 'Nissan',
    'Oldsmobile', 'Opel', 'Plymouth', 'Pontiac', 'Porsche', 'Ram',
    'Renault', 'Rolls Royce', 'Rover', 'Saab', 'Saturn', 'Scion', 'Seat',
    'Skoda', 'Smart', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo'];

exports.isObjEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

exports.isYearValid = (year) => {
    if (typeof year !== 'string') { return false; }
    if (year.length !== 4) { return false; }
    return this.isStringAnInteger(year);
};

exports.isIntYearValid = (year) => {
    if (typeof year !== 'number') { return false; }
    if (!Number.isInteger(year)) { return false; }
    if (Math.sign(year) !== 1) { return false; }
    if (year.toString().length !== 4) { return false; }
    return true;
};

exports.isMakeValid = (make) => {
    return validCarMakes.includes(make);
};

exports.isModelValid = (model) => {
    if (typeof model !== 'string') { return false; }
    if (model.length > 40 || model.length < 1) { return false; }
    return true;
};

exports.isEngineValid = (engine) => {
    if (typeof engine !== 'string') { return false; }
    if (engine.length > 5 || engine.length < 4) { return false; }
    if (!engine.includes('.')) { return false; }
    if (!engine.includes('L')) { return false; }
    return true;
};

exports.isConditionValid = (condition) => {
    let validConditions = ['Good', 'Bad', 'Unsure'];
    return validConditions.includes(condition);
};

exports.isCommentsValid = (comments) => {
    if (typeof comments !== 'string') { return false; }
    if (comments.length > 300) { return false; }
    return true;
};

exports.isMafUnitsValid = (mafUnits) => {
    let validUnits = ['g/s', 'kg/h'];
    return validUnits.includes(mafUnits);
};

exports.isTempUnitsValid = (tempUnits) => {
    let validUnits = ['°F', '°C'];
    return validUnits.includes(tempUnits);
};

exports.isElevationUnitsValid = (elevationUnits) => {
    let validUnits = ['ft', 'm'];
    return validUnits.includes(elevationUnits);
};

exports.isKeywordValid = (keyword) => {
    if (typeof keyword !== 'string') { return false; }
    if (keyword.length < 1 || keyword.length > 50) { return false; }
    return true;
};

exports.isStringAnInteger = (string) => {
    return [...string].every(char => '0123456789'.includes(char));
};

exports.isEmailValid = (email) => {
    if (!email) { return false; }
    return email.includes('@') ? true : false;
};

exports.isUsernameValid = (username) => {
    if (!username) { return false; }
    const illegalChars = /\W/; // only allow letters, numbers, and underscores
    if (username.length < 3 || username.length > 20 || illegalChars.test(username)) {
        return false;
    }
    return true;
};

exports.isPasswordValid = (password) => {
    if (!password) { return false; }
    if (password.length < 8 || password.length > 128) {
        return false;
    }
    return true;
};

exports.isTagValid = (tag) => {
    if (!tag) { return false; }
    if (tag.length < 1 || tag.length > 20) {
        return false;
    }
    return true;
};

exports.isTitleValid = (title) => {
    if (!title) { return false; }
    if (title.length < 1 || title.length > 100) {
        return false;
    }
    return true;
};

exports.mimeToImgFileExt = (mimeType) => {
    let dict = {};
    dict['image/bmp'] = '.bmp';
    dict['image/gif'] = '.gif';
    dict['image/jpeg'] = '.jpg';
    dict['image/png'] = '.png';
    dict['image/svg+xml'] = '.svg';
    return dict[mimeType];
};