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
    const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];

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
            setErrorMessage("部屋が選択されていません。");
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
        if (startTime.hour() >= 23 && endTime.hour() < 6) {
            setErrorMessage("日付を跨ぐ時間設定はできません。");
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
            }
    }, [props.store_message]);

    useEffect(() => {
        setIsSubmitting(false);
    }, [props]); 

    const filteredAgendas = regular_agendas.filter(
    (regular_agenda) =>
        regular_agenda.room_id === selectedRoom &&
        regular_agenda.day_of_the_week !== null &&
        regular_agenda.start_time !== null
    );

    const dayLabel =
        filteredAgendas.length > 0
            ? weekDays[filteredAgendas[0].day_of_the_week - 1]
            : "未定義";
            
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
                <div className="flex justify-around m-4">
                    <PrimaryButton onClick={() => setShowStoreMessage(false)}>
                        閉じる
                    </PrimaryButton>
                    <PrimaryButton onClick={() => router.visit('/home')}>
                        ホームへ
                    </PrimaryButton>
                </div>
            </Modal>
 
            <Modal show={showDeleteMessage} onClose={() => setShowDeleteMessage(false)}>
                <p className="font-semibold text-center m-4">{deleteMessage}</p>
            </Modal>


            <div className="md:flex flex-row">
                <div className="basis-1/3 border-2 border-solid rounded-sm m-2 shadow-xl justify-items-center">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="m-4">
                            <FormControl>
                                <Typography variant="h6" className="text-center">部屋を選択してください</Typography>

                            <div className="block md:hidden">
                                {rooms.length === 0 ? (
                                    <p className="text-gray-500 m-4">登録されている部屋がありません。</p>
                                    ) : (
                                    <div className="md:flex md:flex-row">
                                        <div className="basis-1/2 justify-items-center">
                                        <div>
                                            {(() => {
                                            const selectedRoomObj = rooms.find((room) => room.id === selectedRoom);
                                            return selectedRoomObj ? (
                                                <div key={selectedRoomObj.id} className="p-2 m-2 bg-gray-100 rounded-md">
                                                <p>部屋名： {selectedRoomObj.room_name}</p>

                                                {!hasImageLoaded[selectedRoomObj.id] && (
                                                    <div className="flex justify-center">
                                                        <img
                                                        src={rotateRight}
                                                        alt="ローディング中..."
                                                        className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                                        />
                                                    </div>
                                                )}

                                                    <div className="flex justify-center">
                                                        <img
                                                            className="md:h-48 md:w-96 object-cover rounded-sm"
                                                            src={`/rooms/${selectedRoomObj.img_name}`}
                                                            alt={selectedRoomObj.room_name}
                                                            style={{ display: hasImageLoaded[selectedRoomObj.id] ? "block" : "none" }}
                                                            onLoad={() => handleImageLoad(selectedRoomObj.id)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : null;
                                            })()}
                                        </div>
                                        </div>
                                    </div>
                                    )}

                                    <div className="m-2">
                                        {filteredAgendas.length === 0 ? (
                                        <p className="text-gray-500">予定が登録されていません</p>
                                        ) : (
                                        filteredAgendas.map((regular_agenda) => (
                                            <div key={regular_agenda.id} className="p-2 m-2 bg-gray-100 rounded-md">
                                            <p>登録曜日: {dayLabel}</p>
                                            <p>登録時間: {regular_agenda.start_time}~{regular_agenda.end_time}</p>
                                            </div>
                                        ))
                                        )}
                                    </div>
                                 </div>


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

                <div className="hidden md:block basis-2/3 border-2 border-solid rounded-sm m-2 shadow-xl">
                    <h2 className="text-xl text-center my-4">登録済みの部屋一覧</h2>

                    {rooms.length === 0 ? (
                        <p className="text-center text-gray-500 m-4">部屋が登録されていません。</p>
                    ) : (
                        <ul className="md:grid grid-cols-2">
                            {rooms.map((room) => {
                                const regularAgenda = regular_agendas.find(agenda => agenda.room_id === room.id) || null;
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
                                        <div className="flex justify-center">
                                            <img
                                                src={rotateRight}
                                                alt="ローディング中..."
                                                className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                            />
                                        </div>
                                        )}

                                        <div className="flex justify-center">
                                            <img 
                                                className="h-48 w-96 object-cover rounded-sm m-2"
                                                src={`/rooms/${room.img_name}`} 
                                                alt={room.room_name} 
                                                style={{ display: hasImageLoaded[room.id] ? "block" : "none" }} 
                                                onLoad={() => handleImageLoad(room.id)}
                                            />
                                        </div>

                                        <div className="flex justify-around">
                                        {regularAgenda ? (
                                            regularAgenda.day_of_the_week && regularAgenda.start_time && regularAgenda.end_time ? (
                                                <div className="m-2 p-2 bg-gray-100 rounded-md">
                                                    {weekDays[regularAgenda.day_of_the_week - 1]} | {regularAgenda.start_time}~{regularAgenda.end_time}
                                                </div>
                                    ) : (
                                        <p className="m-2 p-2 bg-gray-100 rounded-md">予定が登録されていません</p>
                                    )
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
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
