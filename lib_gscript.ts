/*
File to store google script specific library functions
 */


import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import NamedRange = GoogleAppsScript.Spreadsheet.NamedRange;

/**
 * @OnlyCurrentDoc
 */

namespace LibGS {
    export function alertInfo(aMsg: string) {
        Logger.log(aMsg);
        SpreadsheetApp.getActiveSpreadsheet().toast(aMsg);
    }

    export function alertError(aMsg: string) {
        aMsg = `⚠️ ${aMsg}`;
        Logger.log(aMsg);
        SpreadsheetApp.getUi().alert(aMsg);
    }

    /**
     * Gets a named range given its name
     * @param rangeName The name of the named range
     * @param spreadsheet The spreadsheet to use, or active if not defined
     * @returns The named range if found else null
     */
    export function getNamedRange(rangeName: string, spreadsheet?: Spreadsheet): NamedRange {
        if (spreadsheet === undefined) {
            spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        }

        const namedRanges = spreadsheet.getNamedRanges();
        for (let i = 0; i < namedRanges.length; i++) {
            if (namedRanges[i].getName() === rangeName) {
                return namedRanges[i];
            }
        }
        return null; /// Range not found
    }

    /**
     * Prompts the user to confirm a destructive action and returns true if the user decided to continue
     * @param title The title of the dialog shown
     * @param prompt The message to display to the user
     * @returns true if OK was clicked else false
     */
    export function confirmDestructiveAction(title: string, prompt: string): boolean {
        const ui = SpreadsheetApp.getUi();
        const response = ui.alert(title, '⚠️' + ' Warning: ' + prompt, ui.ButtonSet.OK_CANCEL);

        return response === ui.Button.OK;
    }

    /**
     * Returns the first empty row after and including `start_row`
     * @param seek_col The column to check
     * @param start_row The minimum row to return
     * @param sheet The sheet to check on
     */
    export function getFirstEmptyRow(seek_col: number, start_row: number, sheet: GoogleAppsScript.Spreadsheet.Sheet): number {
        const seekRange = sheet.getRange(start_row, seek_col, sheet.getMaxRows(), 1).getValues();
        let first_empty_index: number;
        for (first_empty_index = 0; first_empty_index < seekRange.length; first_empty_index++) {
            if (seekRange[first_empty_index][0] === "") {
                break;
            }
        }
        return first_empty_index + start_row;
    }
}
