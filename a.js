const utils = require('./build');

const currDate = new Date();
const yearFromNow = new Date(2022, currDate.getMonth(), currDate.getDate(), currDate.getHours(), currDate.getMinutes(), currDate.getSeconds(), currDate.getSeconds()).getTime();

console.log(utils.humanize(yearFromNow - currDate.getTime()));
console.log(utils.humanize(yearFromNow - currDate.getTime(), true));
console.log(yearFromNow - currDate.getTime());
