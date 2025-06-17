import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from "@inertiajs/react"
import { Head } from '@inertiajs/react';
import cameraIcon from "../assets/icons/cameraIcon.png";
import folderIcon from "../assets/icons/folderIcon.png";
import cameraAdd from "../assets/icons/camera-add.png";
import folderOpen from "../assets/icons/folder-open.png";
import rotateRight from "../assets/icons/rotate_right.png";
import defaultImage from "../assets/icons/default-image.png";
import PrimaryButton from "../Components/PrimaryButton";
import TextInput from "../Components/TextInput";
import Modal from "../Components/Modal";
import DangerButton from "../Components/DangerButton";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Preparation({ rooms = [], regular_agendas = [] }) {
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
               
        // 画像のサイズ変更
        const MAX_FILE_SIZE = 2 * 1024 * 1024; 
        const MIN_QUALITY = 0.3;      
        const QUALITY_DECREMENT = 0.1; 

        const compressImage = (canvas, quality, callback) => {
        canvas.toBlob(
            (blob) => {
            if (!blob) {
                console.error("Blobの生成に失敗しました");
                return;
            }

            if (blob.size > MAX_FILE_SIZE && quality > MIN_QUALITY) {
                compressImage(canvas, quality - QUALITY_DECREMENT, callback);
            } else {
                callback(blob);
            }
            },
            "image/jpeg",
            quality
        );
        };

        // 画像のvalidation
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

        // ファイルをData URLに変換
        const processFile = (file, onSuccess) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataURL = e.target.result;
        const img = new Image();
        img.onload = () => {

        const MAX_EDGE = 4096;
        let width = img.width;
        let height = img.height;
       
        const ratio = Math.min(1, MAX_EDGE / width, MAX_EDGE / height);
        width = width * ratio;
        height = height * ratio;
        
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const initialQuality = 0.6;
        compressImage(canvas, initialQuality, (compressedBlob) => {
            const validationError = validateImage(compressedBlob);
            if (validationError) {
            setImageError(validationError);
            return;
            }
            
            setImageFile(compressedBlob);
            const newReader = new FileReader();
            newReader.onload = (event) => {
            onSuccess(event.target.result);
            };
            newReader.readAsDataURL(compressedBlob);
        });
        };
        img.src = dataURL;
    };
    reader.readAsDataURL(file);
    };

    const getRandomRoom = (rooms) => {
        if (!rooms || rooms.length === 0) {
            console.error("部屋が存在しません！");
            return null;
        }
        return rooms[Math.floor(Math.random() * rooms.length)];
    };

        // 画像取得後のハンドル関数
        const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            processFile(file, (dataURL) => {
            setImageSrc(dataURL);
            });
        }
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
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.capture = "environment";
            fileInput.style.display = "none";
            document.body.appendChild(fileInput);

            fileInput.click();
            fileInput.addEventListener("change", (event) => {
                const file = event.target.files[0];

            if (file) {
                processFile(file, (dataURL) => {
                    setImageSrc(dataURL);
                });
            }
                document.body.removeChild(fileInput);
            });
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
                                <div class="flex justify-center">
                                    <img
                                        src={rotateRight}
                                        alt="ローディング中..."
                                        className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                    />
                                </div>
                            )}
                                <div className="flex justify-center">
                                    <img
                                        src={modalData.image_url}
                                        alt="部屋の画像"
                                        className="md:max-h-[32rem] object-cover rounded-sm"
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                </div>
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
                    <p className="font-semibold text-center m-4">{deleteMessage}</p>
                </Modal>

            <div className="md:flex flex-row">
                <div className="basis-1/3 border-2 border-solid rounded-sm m-1 shadow-xl">
                    <div className="flex flex-col">
                        <h2 className="text-xl text-center font-bold my-4">新しい部屋を登録しましょう！</h2>
                        
                        <div>
                            <img src={imageSrc} alt="部屋の写真" className="w-full rounded-sm"/>
                        </div>
                        <div className="flex justify-around md:justify-end md:mr-4">
                            <div className="md:hidden">
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

                <div className="basis-2/3 border-2 border-solid rounded-sm m-1 shadow-xl">
                    <div className="mb-8 md:mb-0">
                        <h2 className="text-xl text-center font-bold my-4">登録済みの部屋一覧</h2>

                        {rooms.length === 0 ? (
                            <p className="text-center text-gray-500 m-2">部屋が登録されていません。</p>
                        ) : (
                            <ul className="md:grid grid-cols-2">
                                {rooms.map((room) => {
                                    const regularAgenda = regular_agendas.find(agenda => agenda.room_id === room.id) || null;
                                    const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];
                                    const dayLabel = regularAgenda ? weekDays[regularAgenda.day_of_the_week - 1] : "未定義";

                                    return (
                                        <li 
                                            key={room.id}
                                            className="relative p-1 rounded-md transition m-1 bg-gray-200"
                                        >
                                            <p className="m-2 font-bold">部屋名: {room.room_name}</p>
                                            {!hasImageLoaded[room.id] && (
                                            <div className="flex justify-center">
                                                <img
                                                    src={rotateRight}
                                                    alt="ローディング中..."
                                                    className="h-48 w-96 object-scale-down rounded-sm animate-spin m-1"
                                                />
                                            </div>
                                            )}
                                            <div className="flex justify-center">
                                                <img 
                                                    className="h-48 w-96 object-cover rounded-sm m-1"
                                                    src={`/rooms/${room.img_name}`} 
                                                    alt={room.room_name} 
                                                    style={{ display: hasImageLoaded[room.id] ? "block" : "none" }} 
                                                    onLoad={() => handleImageLoad(room.id)}
                                                />
                                            </div>

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
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}