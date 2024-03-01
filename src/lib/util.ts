export const degToRad = (x: number) => (degRefAngle(-(x + 180)) * Math.PI) / 180;
export const radToDeg = (x: number) => degRefAngle(((-x - Math.PI) * 180) / Math.PI);
export const degRefAngle = (x: number) => x % 360;
