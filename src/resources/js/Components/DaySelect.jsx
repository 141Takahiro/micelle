// DaySelect.jsx
import React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';

const DAYS = [
  '月曜日',
  '火曜日',
  '水曜日',
  '木曜日',
  '金曜日',
  '土曜日',
  '日曜日',
];


const DaySelect = ({ selectedDay, setSelectedDay }) => (
  <FormControl>
    <h2 className="text-xl text-center font-bold m-2">曜日を選択してください</h2>
    <Select
      id="day-select"
      value={selectedDay}
      onChange={e => setSelectedDay(Number(e.target.value))}
    >
      {DAYS.map((day, index) => (
        <MenuItem key={index + 1} value={index + 1}>
          {day}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default DaySelect;
