
exports.strToPositiveInt = (str) => {
    if (!str) { return NaN }
    let int = Math.abs(parseInt(str, 10))
    if (isNaN(int)) { return NaN }
    return int
}