import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React from 'react';
import dayjs from "dayjs";

import { router } from "@inertiajs/react"
import { Head } from '@inertiajs/react';
import { FormControl, RadioGroup, Radio, FormControlLabel } from "@mui/material";
import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";

import Modal from "../Components/Modal";
import PrimaryButton from "../Components/PrimaryButton";
import RoomDisplay from '../Components/RoomDisplay';
import SmartphoneRoomDisplay from '../Components/SmartphoneRoomDisplay';
import DaySelect from '../Components/DaySelect';
import TimeRangePicker from '../Components/TimeRangePicker';
import ErrorModal from '../Components/ErrorModal';
import DeleteModal from '../Components/DeleteModal';

import { validateInputs } from '../utils/validateInputs';

import rotateRight from "../assets/icons/rotate_right.png";



export default function Task() {

    // laravelから送られてくるprops
    // constで要素を定義
    const { props } = usePage()
    const {
        rooms: initialRooms = [],
        regular_agendas: initialRegularAgendas = [],
        delete_message = '',
        store_message = '',
        error_message = '',
    } = props

    // データ書き換え用useState
    const [rooms, setRooms] = useState(initialRooms)
    const [regular_agendas, setRegularAgendas] = useState(initialRegularAgendas)
    const [deleteMessage, setDeleteMessage] = useState(delete_message)
    const [storeMessage, setStoreMessage] = useState(store_message)
    const [showStoreMessage, setShowStoreMessage] = useState(false)

    // 入力項目
    const [selectedRoomId, setSelectedRoomId] = useState(rooms.length > 0 ? rooms[0].id : null);
    const [selectedDay, setSelectedDay] = useState(1);
    const [startTime, setStartTime] = useState(dayjs());
    const [endTime, setEndTime] = useState(dayjs().add(30, 'minute'));
    useEffect(() => {
        setEndTime(startTime.clone().add(30, 'minute'));
    }, [startTime]);


    // 画像の読み込み管理
    const [hasImageLoaded, setHasImageLoaded] = useState(() =>
        Object.fromEntries(rooms.map((room) => [room.id, false]))
    );
    const handleImageLoad = (roomId) => {
        setHasImageLoaded((prevState) => ({
            ...prevState,
            [roomId]: true,
        }));
    };

    // バリデーションの非同期実行
    const [isInvalid, setIsInvalid] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const error = validateInputs({ selectedRoomId, selectedDay, startTime, endTime });
        setErrorMessage(error || '');
        setIsInvalid(!!error);
    }, [selectedRoomId, selectedDay, startTime, endTime]);

    // submit用のハンドル
    // selectedRoomIdはラジオボタンと連動（スマホ表示板は画像表示とも連動）
    const selectedRoom = rooms.find(r => r.id === selectedRoomId)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = () => {
        if (isInvalid || isSubmitting) return;
        setIsSubmitting(true);
        const requestData = {
            room_id: selectedRoomId,
            day_of_the_week: selectedDay,
            start_time: startTime.format("HH:mm"),
            end_time: endTime.format("HH:mm"),
        };
        router.post(route("store"), requestData, {
            replace: true,
        });
    };

    // モーダル管理用
    const [showDeleteMessage, setShowDeleteMessage] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);

    // デリート用の関数
    const handleDelete = (id) => {
        if (window.confirm("この部屋を削除してもよろしいですか？")) {
            router.delete(`/task/delete/${id}`);
        }
    };

    // 初期化処理
    useEffect(() => {
        setIsSubmitting(false);

        if (error_message) {
            setErrorModalOpen(true);
        };

        if (delete_message) {
            setDeleteMessage(delete_message);
            setShowDeleteMessage(true);
            setTimeout(() => {
                setShowDeleteMessage(false);
            }, 3000);
        }

        setRooms(initialRooms)
        setRegularAgendas(initialRegularAgendas)

        if (store_message) {
            setStoreMessage(store_message);
            setShowStoreMessage(true);
        }

        if (initialRooms.length > 0) {
            setSelectedRoomId(initialRooms[0].id)
        } else {
            setSelectedRoomId(null)
        }
    }, [
        delete_message,
        initialRooms,
        initialRegularAgendas,
        store_message,
    ])

    // 予定表示用の関数
    const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];
    const filteredAgendas = regular_agendas.filter(
        (regular_agenda) =>
            regular_agenda.room_id === selectedRoomId &&
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

            {/* モーダル */}
            <Modal show={showStoreMessage} onClose={() => setShowStoreMessage(false)}>
                <p className="font-semibold text-center m-4">{storeMessage}</p>
                <div className="flex justify-around m-4">
                    <PrimaryButton onClick={() => setShowStoreMessage(false)}>
                        閉じる
                    </PrimaryButton>
                    <PrimaryButton onClick={() => router.visit('/home')}>
                        ホームへ
                    </PrimaryButton>
                </div>
            </Modal>

            <ErrorModal
                show={errorModalOpen}
                errorMessage={error_message}
                onClose={() => setErrorModalOpen(false)}
            />

            <DeleteModal
                show={showDeleteMessage}
                deleteMessage={deleteMessage}
                onClose={() => setShowDeleteMessage(false)}
            />

            {/* メインコンテンツ */}
            <div className="md:flex flex-row">

                {/* コントロールパネル */}
                <div className="basis-1/3 border-2 border-solid rounded-sm m-1 shadow-xl justify-items-center">
                    <div className="border-b-4 border-gray-200">

                        <h2 className="text-xl text-center font-bold mt-4">部屋を選択してください</h2>

                        {/* スマホ表示部分 */}
                        <div className="block md:hidden">
                            <SmartphoneRoomDisplay
                                rooms={rooms}
                                filteredAgendas={filteredAgendas}
                                selectedRoom={selectedRoom}
                                dayLabel={dayLabel}
                                hasImageLoaded={hasImageLoaded}
                                rotateRight={rotateRight}
                                handleImageLoad={handleImageLoad}
                                selectedRoomId={selectedRoomId}
                                setSelectedRoomId={setSelectedRoomId}

                            />
                        </div>

                        {/* PC用ラジオボタン */}
                        <div className="hidden md:flex justify-center m-4">
                            <FormControl>
                                <RadioGroup
                                    row
                                    aria-labelledby="room-radio-group-label"
                                    name="room=radio-group"
                                    value={selectedRoomId}
                                    onChange={(e) => setSelectedRoomId(Number(e.target.value))}
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

                        <div className="flex flex-col items-center justify-center">

                            {/* 曜日選択 */}
                            <div>
                                <DaySelect
                                    selectedDay={selectedDay}
                                    setSelectedDay={setSelectedDay}
                                />
                            </div>

                            {/* 時間選択 */}
                            <div className="m-4">
                                <TimeRangePicker
                                    startTime={startTime}
                                    endTime={endTime}
                                    setStartTime={setStartTime}
                                    setEndTime={setEndTime}
                                />
                            </div>

                            {/* 投稿用ボタン */}
                            <PrimaryButton
                                className="my-2 w-24 size-12"
                                onClick={handleSubmit}
                                disabled={isInvalid || isSubmitting}
                            >
                                <span className={`"!justify-center w-full ${isSubmitting ? "text-sm" : "text-base"}`}>
                                    {isSubmitting ? "投稿中..." : "投稿"}
                                </span>
                            </PrimaryButton>
                            {errorMessage && <p className="text-red-500 text-sm mt-1 mb-1">{errorMessage}</p>}
                            <div className="mb-4 md:mb-0"></div>
                        </div>
                    </div>
                </div>

                {/* ディスプレイ */}
                <div className="hidden md:block basis-2/3 border-2 border-solid rounded-sm m-1 shadow-xl">
                    <RoomDisplay
                        rooms={rooms}
                        regular_agendas={regular_agendas}
                        hasImageLoaded={hasImageLoaded}
                        selectedRoomId={selectedRoomId}
                        handleImageLoad={handleImageLoad}
                        handleDelete={handleDelete}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
