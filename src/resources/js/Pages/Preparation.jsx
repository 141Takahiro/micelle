import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React from 'react';

import { router } from "@inertiajs/react"
import { Head } from '@inertiajs/react';
import { usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";

import cameraIcon from "../assets/icons/cameraIcon.png";
import folderIcon from "../assets/icons/folderIcon.png";
import defaultImage from "../assets/icons/default-image.png";

import PrimaryButton from "../Components/PrimaryButton";
import TextInput from "../Components/TextInput";
import RoomDisplay from '../Components/RoomDisplay';
import ImageRegister from '../Components/ImageRegister';
import PreparationModal from '../Components/PreparationModal';
import ErrorModal from '../Components/ErrorModal';
import DeleteModal from '../Components/DeleteModal';

import validateImage from '../utils/validateImage';
import validateText from '../utils/validateText';
import openCamera from '../utils/openCamera';
import processFile from '../utils/processFile';


export default function Preparation() {

    // laravelから送られてくるprops
    // constで要素を定義
    const { props } = usePage()
    const {
        rooms: initialRooms = [],
        regular_agendas: initialRegularAgendas = [],
        store_message = '',
        delete_message = '',
        image_url = '',
        error_message = '',
    } = props

    // データ書き換え用useState
    const [rooms, setRooms] = useState(initialRooms)
    const [regular_agendas, setRegularAgendas] = useState(initialRegularAgendas)
    const [modalData, setModalData] = useState({
        store_message,
        image_url,
    })

    // 静的アセット
    const [imageSrc, setImageSrc] = useState(defaultImage);
    const [cameraSrc, setCameraSrc] = useState(cameraIcon);
    const [folderSrc, setFolderSrc] = useState(folderIcon);

    // モーダル関連
    const [showModal, setShowModal] = useState(false);
    const [modalImageLoaded, setModalImageLoaded] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);

    const fileInputRef = useRef(null);

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

    // カメラの画像取得処理
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

    // RoomNameの変更
    const [roomName, setRoomName] = useState('')
    const handleTextChange = (event) => {
        const newRoomName = event.target.value;
        setRoomName(newRoomName);
        const textError = validateText(newRoomName);
        setTextError(textError);
    };

    // RoomNameとImage提出用のハンドル
    const [imageFile, setImageFile] = useState(null);
    const [textError, setTextError] = useState('');
    const [imageError, setImageError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const newTextError = validateText(roomName);
        const newImageError = validateImage(imageFile);
        setTextError(newTextError);
        setImageError(newImageError);
        if (newTextError || newImageError) {
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("room_name", roomName);

        router.post("/upload", formData, {
            replace: true,
        });
    };

    // 画像ローディング管理
    const [hasImageLoaded, setHasImageLoaded] = useState({});
    const handleImageLoad = (roomId) => {
        setHasImageLoaded((prevState) => ({
            ...prevState,
            [roomId]: true,
        }));
    };

    // デリート処理
    const [showDeleteMessage, setShowDeleteMessage] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(delete_message || "");
    const handleDelete = (id) => {
        if (window.confirm("この部屋を削除してもよろしいですか？")) {
            router.delete(`/preparation/delete/${id}`);
        }
    };

    // 初期化処理
    useEffect(() => {
        if (store_message || image_url) {
            setModalData({
                store_message: store_message || "",
                image_url: image_url || "",
            });
            setShowModal(true);
        }
        setIsSubmitting(false);

        if (error_message) {
            setErrorModalOpen(true);
            setTimeout(() => {
                setErrorModalOpen(false);
            }, 3000);
        } else {
            setErrorModalOpen(false);
        };

        if (delete_message) {
            setDeleteMessage(delete_message);
            setShowDeleteMessage(true);
            setTimeout(() => {
                setShowDeleteMessage(false);
            }, 3000);
        }
        setModalImageLoaded(false);
        setRooms(initialRooms)
        setRegularAgendas(initialRegularAgendas)
    }, [
        initialRooms,
        initialRegularAgendas,
        store_message,
        delete_message,
        image_url,
        error_message,
    ])

    // submit時の無効化
    useEffect(() => {
        setImageSrc(defaultImage);
        if (isSubmitting) {
            setRoomName("");
        }
    }, [isSubmitting]);


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Preparation
                </h2>
            }
        >
            <Head title="Preparation" />

            {/* 画像登録時のモーダル */}
            <PreparationModal
                show={showModal}
                onClose={() => setShowModal(false)}
                modalData={modalData}
            />

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

                {/* コンソール */}
                <div className="basis-1/3 border-2 border-solid rounded-sm m-1 shadow-xl">
                    <div className="flex flex-col">
                        <h2 className="text-xl text-center font-bold mt-4 mb-5">新しい部屋を登録しましょう！</h2>

                        <ImageRegister
                            imageSrc={imageSrc}
                            cameraSrc={cameraSrc}
                            handleOpenCamera={handleOpenCamera}
                            setCameraSrc={setCameraSrc}
                            fileInputRef={fileInputRef}
                            handleOpenFolder={handleOpenFolder}
                            folderSrc={folderSrc}
                            setFolderSrc={setFolderSrc}
                        />

                        <div>
                            <label htmlFor="room_name" className="block text-m font-medium text-gray-700 my-2">
                                部屋の名前
                            </label>
                            <TextInput
                                id="room_name"
                                name="room_name"
                                type="text"
                                className="mt-1 block w-full"
                                placeholder="部屋名を入力してください。"
                                value={roomName}
                                onChange={handleTextChange}
                            />
                        </div>
                        <div>
                            <PrimaryButton onClick={handleSubmit}
                                disabled={isSubmitting || rooms.length >= 4 || textError || imageError}
                                className="my-2"
                            >
                                {isSubmitting ? "投稿中..." : "投稿"}
                            </PrimaryButton>
                        </div>
                        {textError && <p className="text-red-500 text-sm mt-1">{textError}</p>}
                        {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
                        {rooms.length >= 4 && <p className="text-red-500 text-sm mt-1">部屋の登録数は４つまでです。</p>}
                    </div>
                </div>

                {/* ディスプレイ */}
                <div className="basis-2/3 border-2 border-solid rounded-sm m-1 shadow-xl">
                    <RoomDisplay
                        rooms={rooms}
                        regular_agendas={regular_agendas}
                        hasImageLoaded={hasImageLoaded}
                        selectedRoomId={null}
                        handleImageLoad={handleImageLoad}
                        handleDelete={handleDelete}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}