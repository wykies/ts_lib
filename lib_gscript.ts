// noinspection JSUnusedGlobalSymbols

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
        aMsg = '⚠️' + ' Error: ' + aMsg;
        Logger.log(aMsg);
        SpreadsheetApp.getUi().alert(aMsg);
    }

    /**
     * Gets a named range given its name
     * @param rangeName The name of the named range
     * @param spreadsheet The spreadsheet to use, or active if not defined
     * @returns The named range if found else null
     */
    export function getNamedRange(rangeName: string, spreadsheet: Spreadsheet = undefined): NamedRange {
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
}