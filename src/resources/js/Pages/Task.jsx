import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from "@inertiajs/react"
import { Head } from '@inertiajs/react';
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { FormControl, Select, MenuItem, Typography, RadioGroup, Radio, FormControlLabel } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as React from "react";
import rotateRight from "../assets/icons/rotate_right.png";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { usePage } from "@inertiajs/react";
import DangerButton from "../Components/DangerButton";
import Modal from "../Components/Modal";
import PrimaryButton from "../Components/PrimaryButton";


export default function Task({ rooms = [], regular_agendas = [] }) {
    const [selectedRoom, setSelectedRoom] = useState(rooms.length > 0 ? rooms[0].id : null);
    const [selectedDay, setSelectedDay] = useState(1);
    const [startTime, setStartTime] = useState(dayjs());
    const { props } = usePage();
    const [showDeleteMessage, setShowDeleteMessage] = useState(false);
    const [isInvalid, setIsInvalid] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(props?.delete_message || "");
    const [storeMessage, setStoreMessage] = useState(props?.store_message || "");
    const [showStoreMessage, setShowStoreMessage] = useState(false);

    const [endTime, setEndTime] = useState(dayjs().add(30, 'minute'));
        useEffect(() => {
            setEndTime(startTime.clone().add(30, 'minute'));
        }, [startTime]);


    const [hasImageLoaded, setHasImageLoaded] = useState(() =>
        Object.fromEntries(rooms.map((room) => [room.id, false]))
    );
    
    const handleImageLoad = (roomId) => {
        setHasImageLoaded((prevState) => ({
        ...prevState,
        [roomId]: true,
        }));
    };

    const validateInputs = () => {
        if (!selectedRoom) {
            setErrorMessage("部屋を選択してください。");
            return true;
        }
        if (!selectedDay || selectedDay < 1 || selectedDay > 7) {
            setErrorMessage("曜日を選択してください。");
            return true;
        }
        if (!startTime || !endTime) {
            setErrorMessage("開始時刻と終了時刻を入力してください。");
            return true;
        }
        if (endTime.isBefore(startTime)) {
            setErrorMessage("終了時刻は開始時刻より後に設定してください。")
            return true;
        }
        setErrorMessage("");
        return false;
    };

    useEffect(() => {
        setIsInvalid(validateInputs());
    }, [selectedRoom, selectedDay, startTime, endTime]);

    const handleSubmit = () => {
        if (isInvalid || isSubmitting) return;

        setIsSubmitting(true);

        const requestData= {
            room_id: selectedRoom,
            day_of_the_week: selectedDay,
            start_time: startTime.format("HH:mm"),
            end_time: endTime.format("HH:mm"),
        };

        console.log("送信するデータ:", requestData);

        router.post(route("store"), requestData, {
            replace: true,
        });
    };

    const handleDelete = (id) => {
        if (window.confirm("この部屋を削除してもよろしいですか？")) {
            router.delete(`/task/delete/${id}`);
        }
    };

    useEffect(() => {
        if (props.delete_message) {
            setDeleteMessage(props.delete_message);
            setShowDeleteMessage(true);

            setTimeout(() => {
                setShowDeleteMessage(false);
            }, 3000);
        }
    }, [props]); 

    
    useEffect(() => {
        if (props.store_message) {
            setStoreMessage(props.store_message); 
            setShowStoreMessage(true);

                setTimeout(() => {
                    setShowStoreMessage(false);
                }, 3000);
            }
    }, [props.store_message]);

    useEffect(() => {
        setIsSubmitting(false);
    }, [props]); 



    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Task
                </h2>
            }
        >
            <Head title="Task" />

            <Modal show={showStoreMessage} onClose={() => setShowStoreMessage(false)}>
                <p className="font-semibold text-center my-4">{storeMessage}</p>
            </Modal>
 
            <Modal show={showDeleteMessage} onClose={() => setShowDeleteMessage(false)}>
                <p className="font-semibold text-center my-4">{deleteMessage}</p>
            </Modal>

            <div className="flex flex-row">
                <div className="basis-1/3 border-2 border-solid rounded-sm m-2 shadow-xl justify-items-center">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="m-4">
                            <FormControl>
                                <Typography variant="h6" className="text-center">部屋を選択してください</Typography>
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
                        </div>

                        <div className="m-4">
                        <FormControl>
                            <Typography variant="h6">曜日を選択してください</Typography>
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
                        </div>

                        <div className="flex m-4">
                            <div className="m-2">
                                <Typography variant="h6">開始時刻</Typography>
                                <MultiSectionDigitalClock
                                    views={["hours", "minutes"]}
                                    ampm={false} 
                                    minutesStep={5}
                                    value={startTime}
                                    onChange={(newValue) => setStartTime(newValue)} 
                                />
                            </div>
                            <div className="m-2">
                                <Typography variant="h6">終了時刻</Typography>
                                <MultiSectionDigitalClock
                                    views={["hours", "minutes"]}
                                    ampm={false} 
                                    minutesStep={5}
                                    value={endTime}
                                    onChange={(newValue) => setEndTime(newValue)}
                                />
                            </div>
                        </div>
                        <div className="m-4">
                            <p>選択された開始時間: {startTime.format("HH:mm")}</p>
                            <p>選択された終了時間: {endTime.format("HH:mm")}</p>
                        </div>
                    </LocalizationProvider>
                    <PrimaryButton 
                        className="my-2 w-24 size-12"
                        onClick={handleSubmit}
                        disabled={isInvalid || isSubmitting}
                    >
                        <span className={`"!justify-center w-full ${isSubmitting ? "text-sm" : "text-base"}`}>
                            {isSubmitting ? "投稿中..." : "投稿"}
                        </span>
                    </PrimaryButton>

                    {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
                </div>

                <div className="basis-2/3 border-2 border-solid rounded-sm m-2 shadow-xl">
                    <h2 className="text-xl text-center my-4">登録済みの部屋一覧</h2>
                        <ul className="grid grid-cols-2">
                            {rooms.map((room) => {
                                const regularAgenda = regular_agendas.find(agenda => agenda.room_id === room.id) || null;
                                const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];
                                const dayLabel = regularAgenda ? weekDays[regularAgenda.day_of_the_week - 1] : "未定義";

                                return (
                                    <li 
                                        key={room.id}
                                        className={`relative p-2 rounded-md transition duration-300 m-2 ${
                                            selectedRoom === room.id ? "bg-blue-500 bg-opacity-50" : "bg-gray-200"
                                        }`}
                                    >
                                        <p className="m-2">部屋名: {room.room_name}</p>
                                        {!hasImageLoaded[room.id] && (
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
                                            style={{ display: hasImageLoaded[room.id] ? "block" : "none" }} 
                                            onLoad={() => handleImageLoad(room.id)}
                                        />

                                        <div className="flex justify-around">
                                            {regularAgenda && regularAgenda.day_of_the_week && regularAgenda.start_time && regularAgenda.end_time ? (
                                                <div className="m-2 p-2 bg-gray-100 rounded-md">
                                                    {weekDays[regularAgenda.day_of_the_week -1]} | {regularAgenda.start_time}~{regularAgenda.end_time}
                                                </div>
                                            ) : (
                                                <p className="m-2 p-2 bg-gray-100 rounded-md">予定が登録されていません</p>
                                            )}
                                            <DangerButton onClick={() => handleDelete(room.id)} className="m-2">                                        
                                                削除
                                            </DangerButton>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
