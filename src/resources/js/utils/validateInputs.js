export const validateInputs = ({ selectedRoomId, selectedDay, startTime, endTime }) => {

    if (!selectedRoomId) {
        return "部屋が選択されていません。";
    }

    if (!selectedDay || selectedDay < 1 || selectedDay > 7) {
        return "曜日を選択してください。";
    }

    if (!startTime || !endTime) {
        return "開始時刻と終了時刻を入力してください。";
    }

    if (endTime.isBefore(startTime)) {
        return "終了時刻は開始時刻より後に設定してください。";
    }

    if (startTime.hour() >= 23) {
        if (endTime.hour() !== 23) {
            return "日付を跨ぐ時間設定はできません。";
        }
        if (endTime.minute() <= startTime.minute()) {
            return "終了時刻は開始時刻より後に設定してください。";
        }
    }

    return null;
};