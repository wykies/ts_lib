/*
File to store google script specific library functions
 */

import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import NamedRange = GoogleAppsScript.Spreadsheet.NamedRange;
import SheetsOnEdit = GoogleAppsScript.Events.SheetsOnEdit;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import { Ok, Result } from "./lib";

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
export function getNamedRange(rangeName: string, spreadsheet?: Spreadsheet): NamedRange | null {
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
  const response = ui.alert(title, "⚠️" + " Warning: " + prompt, ui.ButtonSet.OK_CANCEL);

  return response === ui.Button.OK;
}

/**
 * Returns the first empty row after and including `start_row`
 *
 * Note: if you just want the last filled row in the sheet see
 *  Sheet.getLastRow(), it's worthwhile to mention this may not give you want
 *  you want especially if there are formula that go all the way down the sheet
 *
 * @param seek_col The column to check
 * @param start_row The minimum row to return
 * @param sheet The sheet to check on
 * @param expected_clear number of rows expected to be clear after the last row, if 0 this will be ignored
 */
export function getFirstEmptyRow(
  seek_col: number,
  start_row: number,
  sheet: Sheet,
  expected_clear: number = 100,
): Result<number> {
  const seekRange = sheet.getRange(start_row, seek_col, sheet.getMaxRows(), 1).getValues();
  let first_empty_index: number;
  for (first_empty_index = 0; first_empty_index < seekRange.length; first_empty_index++) {
    if (seekRange[first_empty_index][0] === "") {
      break;
    }
  }

  const clearSearchLimit = Math.min(seekRange.length, first_empty_index + expected_clear);
  for (let i = first_empty_index + 1; i < clearSearchLimit; i++) {
    if (seekRange[i][0] !== "") {
      return new Error(
        `expected ${expected_clear} clear rows after first empty but found ${seekRange[i][0]} on row: ${
          first_empty_index + i
        }`,
      );
    }
  }

  return new Ok(first_empty_index + start_row);
}

export type DateAutoFillConfig = {
  sheetName: string;
  cols: {
    outputCol: number;
    triggerCol: number;
  }[];
}[];

/**
 * Fills in or clears the date column based on the new contents of the trigger column if matched
 * @param e onEdit event
 * @param config Specifies which cells trigger the date update
 */
export function autoFillDate(e: SheetsOnEdit, config: DateAutoFillConfig) {
  const sheet = e.source.getActiveSheet();

  if (e.range.getWidth() === 1 && e.range.getHeight() === 1) {
    let outputCol = calculateOutputCol(e, sheet, config);
    if (outputCol === undefined) {
      // No output necessary
      return;
    }

    const dateCell = sheet.getRange(e.range.getRow(), outputCol);

    if (isEmpty(e, sheet)) {
      // Trigger cell was cleared, remove date
      dateCell.clearContent();
    } else if (dateCell.getValue() == "") {
      // Insert the current date and time
      dateCell.setValue(new Date());
    } else {
      // Already has a value no change made
    }
  }
}

/**
 * @param e onEdit event
 * @param sheet Sheet for the onEdit event
 * @returns true if the value of the changed cell is empty accounting for the
 *          fact that when the user copies and paste the value comes in as
 *          undefined so in that case we need to do an extra read from the
 *          sheet to get the value
 */
function isEmpty(e: SheetsOnEdit, sheet: Sheet): boolean {
  let value = e.value;
  if (value === undefined) {
    // When the user copies and pastes the value comes in as undefined
    value = sheet.getSheetValues(e.range.getRow(), e.range.getColumn(), 1, 1)[0][0];
  }
  return value == "" || value == "FALSE" || value == null;
}

/**
 * Check if the edited cell is one of the trigger cells and if yes returns the
 * column the date should go into
 * @param e onEdit event
 * @param sheet Sheet for the onEdit event
 * @param config Configuration to use to try to find a match
 * @returns the column for the date if a match is found
 */
function calculateOutputCol(
  e: SheetsOnEdit,
  sheet: Sheet,
  config: DateAutoFillConfig,
): number | undefined {
  for (const match_config of config) {
    if (sheet.getName() == match_config.sheetName) {
      for (const cols of match_config.cols) {
        if (e.range.getColumn() == cols.triggerCol) {
          return cols.outputCol;
        }
      }
    }
  }

  return undefined; // No match found
}

/**
 * Updates a sheet protection to start its "excepted" (editable) range at a new row.
 * @param sheet the sheet to modify the protection on
 * @param newStartRow The row number where the exception(unprotected) range should now begin.
 * @returns null if the function completes successfully or ErrorAsValue if the function fails
 */
export function updateSheetProtectionExceptionsRow(
  sheet: Sheet,
  newStartRow: number,
): Result<null> {
  Logger.log(`updateSheetProtectionExceptionsRow called on sheet: ${sheet.getName()}`);

  // Get the sheet protection
  const protection = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
  if (protection === undefined) {
    return new Error("no sheet protection found");
  }

  // Get the current exception ranges
  let currUnprotectedRanges = protection.getUnprotectedRanges();
  let newRangesA1 = [];
  for (const range of currUnprotectedRanges) {
    if (newStartRow >= range.getLastRow()) {
      return new Error(
        `unable to update unprotected range because end row of range is at or before the new start. End: ${range.getLastRow()} and newStart: ${newStartRow}`,
      );
    }
    let newRange = range.getA1Notation().replace(/\d+/, newStartRow.toString());
    Logger.log(`Old: ${range.getA1Notation()}, New: ${newRange}`);
    newRangesA1.push(sheet.getRange(newRange));
  }

  // Replace the ranges
  protection.setUnprotectedRanges(newRangesA1);

  return new Ok(null); // Signal successful completion
}
