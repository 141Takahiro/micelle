import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock';

function TimeRangePicker({ startTime, endTime, setStartTime, setEndTime }) {
    return (
        <div>
            <div className="flex ">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="m-2">
                        <h2 className="text-xl text-center font-semibold">開始時刻</h2>
                        <MultiSectionDigitalClock
                            views={["hours", "minutes"]}
                            ampm={false}
                            minutesStep={5}
                            value={startTime}
                            onChange={(newValue) => setStartTime(newValue)}
                        />
                    </div>
                    <div className="m-2">
                        <h2 className="text-xl text-center font-semibold">終了時刻</h2>
                        <MultiSectionDigitalClock
                            views={["hours", "minutes"]}
                            ampm={false}
                            minutesStep={5}
                            value={endTime}
                            onChange={(newValue) => setEndTime(newValue)}
                        />
                    </div>
                </LocalizationProvider>
            </div>
            <div className="m-4 flex flex-col items-center justify-center">
                <p className="text-gray-600 font-semibold text-base leading-relaxed">選択された開始時間: {startTime.format("HH:mm")}</p>
                <p className="text-gray-600 font-semibold text-base leading-relaxed">選択された終了時間: {endTime.format("HH:mm")}</p>
            </div>
        </div>
    );
}

export default TimeRangePicker;
