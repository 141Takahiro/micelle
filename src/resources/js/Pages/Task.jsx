import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from "@inertiajs/react"
import { Head } from '@inertiajs/react';
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { FormControl, FormLabel, InputLabel, Select, MenuItem, Typography, RadioGroup, Radio, FormControlLabel } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as React from "react";
import rotateRight from "../assets/icons/rotate_right.png";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { usePage } from "@inertiajs/react";


export default function Task({ rooms }) {
    const [selectedRoom, setSelectedRoom] = useState(rooms.length > 0 ? rooms[0].id : null);
    const [selectedDay, setSelectedDay] = useState(1);
    const [startTime, setStartTime] = useState(dayjs());
    const { props } = usePage();
    const regularAgenda = props.regularAgenda;


    const [endTime, setEndTime] = useState(dayjs().add(30, 'minute'));
        useEffect(() => {
            setEndTime(startTime.clone().add(30, 'minute'));
        }, [startTime]);


    const [hasImageLoaded, setHasImageLoaded] = useState(() =>
        Object.fromEntries(rooms.map((room, index) => [index, false]))
    );
    
    const handleImageLoad = (index) => {
        setHasImageLoaded((prevState) => ({
        ...prevState,
        [index]: true,
        }));
    };

    const handleSubmit = () => {
        const requestData= {
            room_id: selectedRoom,
            day_of_the_week: selectedDay,
            start_time: startTime.format("HH:mm"),
            end_time: endTime.format("HH:mm"),
        };

        console.log("送信するデータ:", requestData);

        router.post(route("store"), requestData, {
            onSuccess: ({ props }) => {
                console.log("サーバーから返されたデータ:", props.regularAgenda);
                alert("タスクが正常に保存されました！");
            },
            onError: (errors) => {
                console.error("エラー：", errors);
                    const errorMessages = Object.entries(errors)
                        .map(([key, messages]) => `${key}: ${messages.join(", ")}`)
                        .join("\n");
                    alert(`エラーが発生しました:\n${errorMessages}`);

            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Task
                </h2>
            }
        >
            <Head title="Task" />
            <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <FormControl>
                        <Typography variant="h6">部屋を選択してください</Typography>
                        <FormLabel id="room-radio-group-label">部屋</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="room-radio-group-label"
                            name="room=radio-group"
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(Number(e.target.value))}
                        >
                            {rooms.map((room) => (
                                <FormControlLabel
                                    key={room.id}
                                    value={room.id}
                                    control={<Radio />}
                                    label={room.room_name}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    <FormControl>
                        <Typography variant="h6">曜日を選択してください</Typography>
                        <InputLabel htmlFor="day-select">曜日</InputLabel>
                        <Select
                            id="day-select"
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(Number(e.target.value))}
                        >
                            {["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"].map((day, index) => (
                                <MenuItem key={index + 1} value={index + 1}>
                                    {day}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="h6">開始時刻</Typography>
                    <MultiSectionDigitalClock
                        views={["hours", "minutes"]}
                        ampm={false} 
                        minutesStep={5}
                        value={startTime}
                        onChange={(newValue) => setStartTime(newValue)} 
                    />

                    <Typography variant="h6">終了時刻</Typography>
                    <MultiSectionDigitalClock
                        views={["hours", "minutes"]}
                        ampm={false} 
                        minutesStep={5}
                        value={endTime}
                        onChange={(newValue) => setEndTime(newValue)}
                    />

                    <p>選択された開始時間: {startTime.format("HH:mm")}</p>
                    <p>選択された終了時間: {endTime.format("HH:mm")}</p>
                </LocalizationProvider>
                <button 
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
                    onClick={handleSubmit}
                >
                    投稿
                </button>
            </div>

            <div>
                <h2 className="text-xl text-center my-4">登録済みの部屋一覧</h2>
                    <ul className="grid grid-cols-2 gap-4">
                        {rooms.map((room, index) => (
                            <li 
                                key={index}
                                className={`relative p-4 rounded-md transition duration-300 ${
                                    selectedRoom === room.id ? "bg-blue-500 bg-opacity-50" : "bg-gray-200"
                                }`}
                            >
                                <p className="m-2">部屋名: {room.room_name}</p>
                                    {!hasImageLoaded[index] && (
                                        <img
                                            src={rotateRight}
                                            alt="ローディング中..."
                                            className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                        />
                                    )}
                                        <img 
                                            className="h-48 w-96 object-cover rounded-sm m-2"
                                            src={`/rooms/${room.img_name}`} 
                                            alt={room.room_name} 
                                            style={{ display: hasImageLoaded[index] ? "block" : "none" }} 
                                            onLoad={() => handleImageLoad(index)}
                                        />
                            </li>
                        ))}
                    </ul>
                </div>
        </AuthenticatedLayout>
    );
}
