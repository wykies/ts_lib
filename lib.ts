// Version 0.1

/**
 * Use to create a run once version of a function
 * Example usage:
 *
 * let myRunOnceFunc = once(function (value) {
 *   console.log('Fired!');
 *   return "Input value was " + value;
 * });
 *
 * console.log(myRunOnceFunc(123)); //"Fired" and "Input value was 123"
 * console.log(myRunOnceFunc(2)); //Only "Input value was 123"
 *
 * @param {function} fn function to be converted
 * @param {type} context not sure, more testing needed
 * @returns {function} The run only once version of fn
 */
export function once(fn, context) {
    let result;

    return function () {
        if (fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }

        return result;
    };
}

/**
 * Asserts the condition and if it fails throws an exception.
 *
 * Patterned on <https://gist.github.com/jeromeetienne/2651899>
 *
 * @param cond The condition that should be true
 * @param text The text to show on assert failure
 */
export function assertOrDie(cond, text) {
    if (!cond)
        throw new Error(text || "Assertion failed!");
}

/**
 * Only considers the time and checks if `x` is greater than `y`
 * @param a {Date} the first time to check
 * @param b {Date} the second time to check
 * @returns {boolean} true if a > b, considering only time and false otherwise
 */
export function isTimeGreater(a, b) {
    return a.getHours() > b.getHours() ||
        (a.getHours() === b.getHours() && a.getMinutes() > b.getMinutes());
}

/**
 * Checks if two date/time values are on the same day (ignoring the time)
 * @param {Date} a the first date to check
 * @param {Date} b the second date to check
 * @returns {boolean} true if they are on the same day and false otherwise
 */
export function isSameDay(a, b) {
    return a.getDate() === b.getDate()
        && a.getMonth() === b.getMonth()
        && a.getFullYear() === b.getFullYear();
}

/**
 * Returns only the date portion of the date passed
 * @param aDate The datetime to extract the date from
 * @returns {Date} Date portion of date passed in
 */
export function getDateOnly(aDate) {
    return new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
}

/**
 * Prepends 0's if number has less than `minDigits` before the decimal point
 * @param num {number} - The number to prepend the 0's to
 * @param minDigits {number} The minimum number of digits before the decimal point
 * @returns {string} The number prefixed with 0's as needed
 */
export function zeroPad(num, minDigits) {
    const intPart = Math.floor(num);
    const digitsNeeded = minDigits - (intPart + '').length;
    let prefix = '';
    while (prefix.length < digitsNeeded) {
        prefix += '0';
    }
    return prefix + num;
}

/**
 * Check if the date/time value passed is on the Google Sheets Epoch (independent of the time)
 * @param {Date} d the date to check
 * @returns {boolean} true if it is on the Epoch and false otherwise
 */
export function isOnEpochGSheets(d) {
    return isSameDay(d, getEpochGSheets());
}

/**
 * Returns the Epoch used by Google Sheets
 * @returns {Date} Google Sheets Epoch
 */
export function getEpochGSheets() {
    return new Date(1899, 11, 30);
}