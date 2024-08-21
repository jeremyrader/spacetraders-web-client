export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function getRandomPointInCircle(radius: number) {
  const angle = Math.random() * Math.PI * 2; // Random angle
  const r = radius * Math.sqrt(Math.random()); // Random radius within the circle
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
    distance: r, // Include the distance from the center
  };
}

export function getRandomStarColor() {
  const spectrum = getRandomInt(1, 3);
  switch (spectrum) {
    case 1:
      return getRandomBlue();
    case 2:
      return getRandomRed();
    case 3:
      return getRandomYellow();
    default:
      return 'white';
  }
}

export function getRandomBlue() {
  const blue = getRandomInt(200, 255);
  const green = getRandomInt(100, 180);
  const red = getRandomInt(0, 100);
  return `rgb(${red}, ${green}, ${blue})`;
}

export function getRandomRed() {
  const red = getRandomInt(200, 255);
  const green = getRandomInt(0, 100);
  const blue = getRandomInt(0, 100);
  return `rgb(${red}, ${green}, ${blue})`;
}

export function getRandomYellow() {
  const red = getRandomInt(200, 255);
  const green = getRandomInt(200, 255);
  const blue = getRandomInt(0, 100);
  return `rgb(${red}, ${green}, ${blue})`;
}

export function getRandomOrange() {
  const red = getRandomInt(200, 255);
  const green = getRandomInt(100, 150);
  const blue = getRandomInt(0, 50);
  return `rgb(${red}, ${green}, ${blue})`;
}

export function generatePointsOnCircle(radius: number, numberOfPoints: number) {
  const points = [];
  const angleStep = (2 * Math.PI) / numberOfPoints;

  for (let i = 0; i < numberOfPoints; i++) {
    const angle = i * angleStep;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push({ x, y });
  }

  return points;
}
