import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from "@inertiajs/react"
import { Head } from '@inertiajs/react';
import cameraIcon from "../assets/icons/cameraIcon.png";
import folderIcon from "../assets/icons/folderIcon.png";
import cameraAdd from "../assets/icons/camera-add.png";
import folderOpen from "../assets/icons/folder-open.png";
import rotateRight from "../assets/icons/rotate_right.png";
import PrimaryButton from "../Components/PrimaryButton";
import TextInput from "../Components/TextInput";
import Modal from "../Components/Modal";
import DangerButton from "../Components/DangerButton";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Preparation({ rooms = [], regular_agendas = [] }) {
        const defaultImage = "/storage/images/default-image.png";
        const [imageSrc, setImageSrc] = useState(defaultImage);
        const [imageFile, setImageFile] = useState(null);
        const [roomName, setRoomName] = useState('')
        const [textError, setTextError] = useState('');
        const [imageError, setImageError] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [cameraSrc, setCameraSrc] = useState(cameraIcon);
        const [folderSrc, setFolderSrc] = useState(folderIcon);
        const [showModal, setShowModal] = useState(false);
        const [modalData, setModalData] = useState({ store_message: "", image_url: ""});
        const [imageLoaded, setImageLoaded] = useState(false);
        const [hasImageLoaded, setHasImageLoaded] = useState({});
        const [showDeleteMessage, setShowDeleteMessage] = useState(false);
        const { props } = usePage();
        const [deleteMessage, setDeleteMessage] = useState(props?.delete_message || "");
        


        const validateImage = (file) => {
            if (!file || file === null || file === undefined) { 
                return "ファイルが選択されていません。";
            }
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
            const maxSize = 2 * 1024 * 1024;
            if (!allowedTypes.includes(file.type)) {
                return "許可されていないファイル形式です。JPEG, PNG, JPGのみアップロードできます。";
            }
            if (file.size > maxSize) {
                return "ファイルサイズが２ＭＢを超えています。";
            }
            return null;
        };

        const validateText = (text) => {
            if (!text.trim()) {
                return "部屋名を入力してください。";
            }
            if (text.length < 2 || text.length > 20) {
                return "部屋名は２～２０文字の範囲で入力してください。";
            }
            return null;
        };


        const openCamera = () => {
            console.log("カメラアイコンがクリックされました。");
        };

        const handleImageChange = (event) => {
            const file = event.target.files[0];
            const imageError = validateImage(file);

            setImageError(imageError);

            if (!imageError) {
                setImageFile(file);

                const reader = new FileReader();
                reader.onload = (e) => {
                    setImageSrc(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };

        const handleTextChange = (event) => {
            const newRoomName = event.target.value;
                setRoomName(newRoomName);
            const textError = validateText(newRoomName);
                setTextError(textError);
        };


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

        const [roomCount, setRoomCount] = useState(rooms?.length ?? 0);
            useEffect(() => {
                if (rooms) {
                    setRoomCount(rooms.length);
                }
            }, [rooms]);

        const handleImageLoad = (roomId) => {
            setHasImageLoaded((prevState) => ({
            ...prevState,
            [roomId]: true,
            }));
        };
        
        const handleDelete = (id) => {
            if (window.confirm("この部屋を削除してもよろしいですか？")) {
                router.delete(`/preparation/delete/${id}`);
            }
        };

        useEffect(() => {
            if (props.store_message || props.image_url) {
                setModalData({
                    store_message: props.store_message || "",
                    image_url: props.image_url || "",
                });

                setShowModal(true);
            }
        }, [props.store_message, props.image_url]);


        useEffect(() => {
            setIsSubmitting(false);
        }, [props]);

        useEffect(() => {
            if (props.delete_message) {
                setDeleteMessage(props.delete_message);
                setShowDeleteMessage(true);
        
                setTimeout(() => {
                    setShowDeleteMessage(false);
                }, 3000);
            }
        }, [props]); 

        const goToTaskPage = () => {
            router.get(route('task')); 
        };
        
        useEffect(() => {
            setImageLoaded(false);
        }, [modalData.image_url]);

        useEffect(() => {
            setImageSrc(defaultImage);
        }, []);


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Preparation
                </h2>
            }
        >
            <Head title="Preparation" />

            <Modal show={showModal} onClose={() => setShowModal(false)} className="flex flex-col">
                <h2 className="text-center m-4">{modalData.store_message}</h2>
                {modalData.image_url && (
                    <>
                        {!imageLoaded && (
                            <img
                                src={rotateRight}
                                alt="ローディング中..."
                                className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                            />
                        )}
                        <img
                            src={modalData.image_url}
                            alt="部屋の画像"
                            className="h-48 w-96 object-cover rounded-sm m-2"
                            onLoad={() => setImageLoaded(true)}
                        />
                    </>
                )}
                <div className="flex justify-around">
                    <PrimaryButton onClick={() => setShowModal(false)} className="m-2">
                        部屋を追加する
                    </PrimaryButton>
                    <PrimaryButton onClick={goToTaskPage} className="m-2">
                        タスクを登録する
                    </PrimaryButton>
                </div>
            </Modal>

            <Modal show={showDeleteMessage} onClose={() => setShowDeleteMessage(false)}>
                <p className="font-semibold text-center my-4">{deleteMessage}</p>
            </Modal>

            <div className="flex flex-row">
                <div className="basis-1/3 border-2 border-solid rounded-sm m-2 shadow-xl">
                    <div className="flex flex-col">
                        <h2 className="text-xl text-center my-4">新しい部屋を登録しましょう！</h2>
                        <div>
                            <img src={imageSrc} alt="部屋の写真" className="w-full rounded-sm"/>
                        </div>
                        <div className="flex justify-around">
                            <div>
                                <button
                                    onClick={openCamera}
                                    onMouseEnter={() => setCameraSrc(cameraAdd)}
                                    onMouseLeave={() => setCameraSrc(cameraIcon)}
                                >
                                    <img src={cameraSrc} alt="カメラアイコン" style={{ width: "50px", height: "50px" }} />
                                </button>
                            </div>
                            <div>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="fileInput" />
                                <button
                                    onClick={() => document.getElementById("fileInput").click()}
                                    onMouseEnter={() => setFolderSrc(folderOpen)}
                                    onMouseLeave={() => setFolderSrc(folderIcon)}
                                >
                                    <img src={folderSrc} alt="フォルダアイコン" style={{ width: "50px", height: "50px" }} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="room_name" className="block text-sm font-medium text-gray-700 my-2">
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
                                        className="relative p-2 rounded-md transition m-2 bg-gray-200"
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