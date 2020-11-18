const getRandomNum = (max = 0, min = 0) => {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

const map_range = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export {
    getRandomNum,
    map_range
}