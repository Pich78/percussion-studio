import { getValidInstrumentSteps } from './js/utils/gridUtils.js';

const steps = 28;
const valid = getValidInstrumentSteps(steps);

console.log(`Steps: ${steps}`);
console.log(`Valid Options: ${JSON.stringify(valid)}`);

if (valid.includes(7)) {
    console.log("PASS: 7 is included.");
} else {
    console.error("FAIL: 7 is NOT included.");
}
