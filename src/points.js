const pointSystem = {

    easy: {
        first: 100,
        second: 70,
        third: 40
    },

    medium: {
        first: 200,
        second: 140,
        third: 80
    },

    hard: {
        first: 300,
        second: 230,
        third: 160
    }

};


export function getPoints(
    difficulty,
    mistakes
) {

    const points =
        pointSystem[difficulty];

    if (!points) {
        return 0;
    }

    if (mistakes === 0) {
        return points.first;
    }

    if (mistakes === 1) {
        return points.second;
    }

    if (mistakes === 2) {
        return points.third;
    }

    return 0;
}


export function getMaxPoints(
    difficulty
) {

    const points =
        pointSystem[difficulty];

    if (!points) {
        return 0;
    }

    return points.first;
}


export function getPointSystem() {

    return pointSystem;

}