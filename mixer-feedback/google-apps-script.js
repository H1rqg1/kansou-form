function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        // Use openById to ensure we connect to the correct sheet even if the script is standalone
        var sheet = SpreadsheetApp.openById("18dlXrMzdWa_-ArmJ5ODcB2UxhZZjFeY6x-QBnbzbTxI").getActiveSheet();

        // Parse the incoming JSON data
        var data = JSON.parse(e.postData.contents);

        // Convert department code
        var deptName = "";
        if (data.department === "IT") {
            deptName = "情報工学科";
        } else if (data.department === "DE") {
            deptName = "デジタルエンタテインメント学科";
        } else {
            deptName = data.department;
        }

        // Prepare the row data
        var row = [
            new Date(),
            data.name,
            "-", // Student ID is removed from form
            deptName,
            data.satisfaction,
            data.bestPart,
            data.message
        ];

        // Append to the sheet
        sheet.appendRow(row);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "row": row }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function setupSheet() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var headers = ["タイムスタンプ", "お名前", "学籍番号", "学科", "満足度", "印象に残ったこと", "メッセージ"];
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
        sheet.setFrozenRows(1);
    }
}
