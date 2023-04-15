// Version 1.6
// noinspection JSUnusedGlobalSymbols

namespace Lib {
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
     * @param fn function to be converted
     * @param context not sure, more testing needed
     * @returns The run only once version of fn
     */
    export function once(fn: Function, context: any): Function {
        let result;

        return function () {
            if (fn) {
                result = fn.apply(context || this, arguments);
                fn = function () { };
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
    export function assertOrDie(cond: boolean, text?: string) {
        if (!cond)
            throw new Error(text || "Assertion failed!");
    }

    /**
     * Only considers the time and checks if `x` is greater than `y`
     * @param a the first time to check
     * @param b the second time to check
     * @returns true if a > b, considering only time and false otherwise
     */
    export function isTimeGreater(a: Date, b: Date): boolean {
        return a.getHours() > b.getHours() ||
            (a.getHours() === b.getHours() && a.getMinutes() > b.getMinutes());
    }

    /**
     * Checks if two date/time values are on the same day (ignoring the time)
     * @param a the first date to check
     * @param b the second date to check
     * @returns true if they are on the same day and false otherwise
     */
    export function isSameDay(a: Date, b: Date): boolean {
        return a.getDate() === b.getDate()
            && a.getMonth() === b.getMonth()
            && a.getFullYear() === b.getFullYear();
    }

    /**
     * Check if the month of two dates is the same. NB: Must also be same year.
     * @param {date} a the first date to check
     * @param {date} b the second date to check
     * @returns {Boolean} True if the month of the dates is the same otherwise false
     */
    export function isSameMonth(a: Date, b: Date) {
        return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    }

    /**
     * Returns only the date portion of the date passed
     * @param aDate The datetime to extract the date from
     * @returns Date portion of date passed in
     */
    export function getDateOnly(aDate: Date): Date {
        return new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
    }

    /**
     * Prepends 0's if number has less than `minDigits` before the decimal point
     * @param num The number to prepend the 0's to
     * @param minDigits The minimum number of digits before the decimal point
     * @returns The number prefixed with 0's as needed
     */
    export function zeroPad(num: number, minDigits: number): string {
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
     * @param d the date to check
     * @returns true if it is on the Epoch and false otherwise
     */
    export function isOnEpochGSheets(d: Date): boolean {
        return isSameDay(d, getEpochGSheets());
    }

    /**
     * Returns the Epoch used by Google Sheets
     * @returns Google Sheets Epoch
     */
    export function getEpochGSheets(): Date {
        return new Date(1899, 11, 30);
    }

    /**
     * Converts a 2d array into a csv string
     *
     * @param arr The array to be converted
     */
    export function generateCsvOutputFrom2dArray<T>(arr: T[][]): string {
        let result = "";
        if (arr.length === 0 || arr[0].length === 0) {
            return result;
        }
        for (let row = 0; row < arr.length; row++) {
            for (let col = 0; col < arr[0].length; col++) {
                result += `${arr[row][col]},`;
            }
            result += '\n'
        }
        return result;
    }

    /**
     * Each unique value in `arr` is assigned a number and those numbers are used to generate a new array that is
     * returned along with a dictionary of what the values  were converted to. This is helpful when the values in `arr`
     * are too longer to be exported to say a string using `generateCsvOutputFrom2dArray`.
     *
     * NB: Values are converted to strings before comparison as this is used as the key to the dictionary.
     *
     * @param arr The values to be converted
     */
    export function arrValuesToNums<T>(arr: T[][]): [number[][], Record<string, number>] {
        let nextID = 1;
        const records: Record<string, number> = {};
        const converted: number[][] = [];
        for (let row = 0; row < arr.length; row++) {
            const newRowValues: number[] = [];
            converted.push(newRowValues);
            for (let col = 0; col < arr[0].length; col++) {
                const arrValueAsStr = `${arr[row][col]}`;
                let value = records[arrValueAsStr];
                if (value === undefined) {
                    records[arrValueAsStr] = nextID++;
                    value = records[arrValueAsStr]
                    assertOrDie(records[arrValueAsStr] !== undefined, "Logic error this value was just supposed to have been set");
                }
                newRowValues.push(value);
            }
        }
        return [converted, records];
    }

    /**
     * Returns true if any of the elements in the array are exactly equal to searchValue
     */
    export function arrayIncludes(searchValue: any, arr: any[]): boolean {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === searchValue) {
                return true;
            }
        }
        return false;
    }

    /**
     * Asserts that the input is a number
     */
    export function assertIsNumber(val: any, msg_prefix?: string): number {
        if (typeof val !== 'number') {
            throw Error(`${(msg_prefix === undefined) ? '' : msg_prefix + ' '}Expected a number but got "${val}" of type "${typeof val}"`);
        } else {
            return val;
        }
    }

    /**
     * Asserts that the input is a date (Fails if objects are passed across frame boundaries)
     */
    export function assertIsDate(val: any, msg_prefix?: string): Date {
        if (val instanceof Date) {
            return val;
        } else {
            throw Error(`${(msg_prefix === undefined) ? '' : msg_prefix + ' '}Expected a date but got "${val}" of type "${typeof val}"`);
        }
    }


    /**
     * Ensures all inner arrays are the same length by increasing their length to the max length
     */
    export function makeAllInnerArraysSameLength(arr: any[][]) {
        // Get max inner length
        let max = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === undefined) {
                arr[i] = [];
            }
            if (arr[i].length > max) {
                max = arr[i].length;
            }
        }

        // Set all to max
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].length < max) {
                arr[i][max - 1] = '';
            }
        }
    }
}