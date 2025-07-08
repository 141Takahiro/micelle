import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React from 'react';

import { Head } from '@inertiajs/react';
import { useEffect, useState, useRef } from "react";
import { router } from '@inertiajs/react';
import { usePage } from "@inertiajs/react";

import micelleEvaluateImage from "../assets/icons/micelle_evaluate.jpg";
import cameraIcon from "../assets/icons/cameraIcon.png";
import folderIcon from "../assets/icons/folderIcon.png";
import defaultImage from "../assets/icons/default-image.png";
import rotateRight from "../assets/icons/rotate_right.png";

import SmartphoneRoomDisplay from '../Components/SmartphoneRoomDisplay';
import MicelleEvaluateCard from '../Components/MicelleEvaluateCard';
import WeeklyTaskCard from '../Components/WeeklyTaskCard';
import AiEvaluateModal from '../Components/AiEvaluateModal';
import ImageUpdateModal from '../Components/ImageUpdateModal';
import RoomGaugeGraph from '../Components/RoomGaugeGraph';
import HomeDisplay from '../Components/HomeDisplay';
import ErrorModal from '../Components/ErrorModal';

import validateImage from '../utils/validateImage';
import openCamera from '../utils/openCamera';
import processFile from '../utils/processFile';

export default function Home() {

    // laravelから送られてくるprops
    // constで要素を定義
    const { props } = usePage()
    const {
        rooms: initialRooms = [],
        agendas: initialAgendas = [],
        regular_agendas: initialRegularAgendas = [],
        updatePhoto_message = '',
        micelle_message = '',
        error_message = '',
        score = null,
        image_url = '',
    } = props

    // データ書き換え用useState
    const [rooms, setRooms] = useState(initialRooms);
    const [agendas, setAgendas] = useState(initialAgendas);
    const [regular_agendas, setRegularAgendas] = useState(initialRegularAgendas)
    const [modalData, setModalData] = useState({
        updatePhoto_message: updatePhoto_message || "",
        micelle_message: micelle_message || "",
        score: score ?? null,
        image_url: image_url || "",
    });

    // 静的コンポーネント
    const [imageSrc, setImageSrc] = useState(defaultImage);
    const [cameraSrc, setCameraSrc] = useState(cameraIcon);
    const [folderSrc, setFolderSrc] = useState(folderIcon);

    // 選択された部屋のID
    const [selectedRoomId, setSelectedRoomId] = useState(rooms.length > 0 ? rooms[0].id : "");

    // プレート表示用latestAgendas
    const [latestAgendas, setLatestAgendas] = useState([]);
    useEffect(() => {
        const updatedLatestAgendas = rooms.map((room) => {
            const roomAgendas = agendas[room.id] || [];
            if (roomAgendas.length > 0) {
                const sortedAgendas = [...roomAgendas].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                return sortedAgendas[0];
            }
            return null;
        });
        setLatestAgendas(updatedLatestAgendas);
    }, [rooms, agendas]);

    // statusとai_evaluateの状態に合わせてAI評価ボタンのレイアウトを変更
    const allCompleted = latestAgendas.every((agenda) => agenda && agenda.status === 1);
    const hasAiEvaluate = latestAgendas.some((agenda) => agenda && agenda.ai_evaluate);

    // モーダルの状態管理
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageLoaded, setModalImageLoaded] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);

    // 画像読み込み処理
    const [hasImageLoaded, setHasImageLoaded] = useState(() =>
        Object.fromEntries(rooms.map((room) => [room.id, false]))
    );
    const handleImageLoad = (roomId) => {
        setHasImageLoaded((prevState) => ({
            ...prevState,
            [roomId]: true,
        }));
    };

    // ステータス更新処理
    const [isStatusLoading, setisStatusLoading] = useState(false);
    const handleStatusUpdate = (roomId, agendaId, currentStatus) => {
        setisStatusLoading(true);
        const newStatus = currentStatus === 1 ? 0 : 1;
        router.put(
            `/agendas/${agendaId}/update-status`,
            { status: newStatus },
            {
                onSuccess: () => {
                    setAgendas((prevAgendas) => {
                        const updatedAgendas = { ...prevAgendas };
                        if (updatedAgendas[roomId]) {
                            updatedAgendas[roomId] = updatedAgendas[roomId].map((agenda) =>
                                agenda.id === agendaId ? { ...agenda, status: newStatus } : agenda
                            );
                        }
                        return updatedAgendas;
                    });
                },
                onFinish: () => {
                    setisStatusLoading(false);
                },
            }
        );
    };

    // カメラ画像取得処理
    const handleOpenCamera = async () => {
        try {
            const originalFile = await openCamera();
            const { dataURL, file: processedFile } = await processFile(originalFile);
            setImageSrc(dataURL);
            setImageFile(processedFile);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setImageError('');
        } catch (e) {
            setImageError(e.message);
        }
    };

    // フォルダ画像取得処理
    const handleOpenFolder = (event) => {
        const originalFile = event.target.files[0];
        if (originalFile) {
            processFile(originalFile)
                .then(({ dataURL, file: processedFile }) => {
                    setImageSrc(dataURL);
                    setImageFile(processedFile);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    setImageError('');
                })
                .catch((error) => {
                    setImageError(error.message);
                    console.error(error);
                });
        }
    };

    // 画像の投稿管理
    const fileInputRef = useRef(null);
    const [imageError, setImageError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const handleSubmit = async () => {
        const newImageError = validateImage(imageFile);
        setImageError(newImageError);
        if (newImageError) {
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        router.post(`/updatePhoto/${selectedRoomId}`, formData, {
            replace: true,
            onFinish: () => setIsSubmitting(false),
        });

    };

    const currentRoom = rooms.find(room => room.id === selectedRoomId);

    // 初期化処理
    useEffect(() => {
        if (updatePhoto_message || score || micelle_message || image_url) {
            setModalData({
                updatePhoto_message: updatePhoto_message || "",
                score: score ?? null,
                micelle_message: micelle_message || "",
                image_url: image_url || "",
            });
            setUpdateModalOpen(true);
        }

        if (error_message) {
            setErrorModalOpen(true);
        }

        setisStatusLoading(false);
        setModalImageLoaded(false);
        setIsModalOpen(false);
        setIsSubmitting(false);
        setRooms(initialRooms);
        setRegularAgendas(initialRegularAgendas);
        setAgendas(initialAgendas); 
    }, [
        initialRooms,
        initialRegularAgendas,
        updatePhoto_message,
        score,
        micelle_message,
        image_url,
        error_message,
        agendas,
    ]);

    useEffect(() => {
        setImageSrc(defaultImage);
    }, [isSubmitting]);

    // 清掃タスク表示用
    const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];
    const selectedRoom = rooms.find(room => room.id === selectedRoomId);
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
                    Home
                </h2>
            }
        >
            <Head title="Home" />

            {/* モーダル関連 */}

            <ErrorModal
                show={errorModalOpen}
                errorMessage={error_message}
                onClose={() => setErrorModalOpen(false)}
            />

            <AiEvaluateModal
                show={updateModalOpen}
                onClose={() => setUpdateModalOpen(false)}
                modalData={modalData}
                modalImageLoaded={modalImageLoaded}
                setModalImageLoaded={setModalImageLoaded}
            />

            <ImageUpdateModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
                rooms={rooms}
                imageSrc={imageSrc}
                cameraSrc={cameraSrc}
                handleOpenCamera={handleOpenCamera}
                setCameraSrc={setCameraSrc}
                fileInputRef={fileInputRef}
                handleOpenFolder={handleOpenFolder}
                folderSrc={folderSrc}
                setFolderSrc={setFolderSrc}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                imageError={imageError}
                currentRoom={currentRoom}
            />


            {/* メインコンテンツ */}
            <div className="md:flex md:flex-row">

                {/* タスクカード */}
                <div className="basis-1/3 border-2 border-solid rounded-sm m-1 shadow-xl justify-items-center p-2">
                    <div className="w-full">
                        <WeeklyTaskCard
                            rooms={rooms}
                            latestAgendas={latestAgendas}
                            isStatusLoading={isStatusLoading}
                            handleStatusUpdate={handleStatusUpdate}
                            setSelectedRoomId={setSelectedRoomId}
                        />
                    </div>
                </div>

                {/* スマホ用AI判定ボタン */}
                {rooms.length > 0 && (
                    <div className="md:hidden p-4">
                        <MicelleEvaluateCard
                            allCompleted={allCompleted}
                            hasAiEvaluate={hasAiEvaluate}
                            micelleEvaluateImage={micelleEvaluateImage}
                            setIsModalOpen={setIsModalOpen}
                        />
                    </div>
                )}

                {/* データパネル */}
                <div className="basis-2/3 border-2 border-solid rounded-sm m-1 shadow-xl justify-items-center">
                    <h2 className="text-xl font-bold m-2">登録されている部屋</h2>

                    {rooms.length === 0 ? (
                        <p className="text-gray-500 m-4">登録されている部屋がありません。</p>
                    ) : (
                        <>
                            <div className="md:flex md:flex-row">
                                <div className="basis-1/2 justify-items-center">

                                    {/* スマホ用ディスプレイ */}
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

                                    {/* PC用ディスプレイ（Home画面仕様) */}
                                    <div className="hidden md:block">
                                        <HomeDisplay
                                            rooms={rooms}
                                            selectedRoomId={selectedRoomId}
                                            setSelectedRoomId={setSelectedRoomId}
                                            hasImageLoaded={hasImageLoaded}
                                            handleImageLoad={handleImageLoad}
                                            allCompleted={allCompleted}
                                            hasAiEvaluate={hasAiEvaluate}
                                            micelleEvaluateImage={micelleEvaluateImage}
                                            setIsModalOpen={setIsModalOpen}
                                        />

                                    </div>
                                </div>

                                <div className="md:basis-1/2 mt-6 mb-4 md:mb-0 md:border-l-4 border-gray-200">
                                    {/* グラフコンポーネント */}
                                    <RoomGaugeGraph
                                        rooms={rooms}
                                        selectedRoomId={selectedRoomId}
                                        agendas={agendas}
                                    />

                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
