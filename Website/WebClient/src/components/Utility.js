const getRandomNum = (max = 0, min = 0) => {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

export {
    getRandomNum
}