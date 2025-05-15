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
import SecondaryButton from "../Components/SecondaryButton";
import { useEffect, useState } from "react";

export default function Preparation({ rooms }) {
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
        const [modalData, setModalData] = useState({ message: "", room_name: "", image_url: ""});
        const [imageLoaded, setImageLoaded] = useState(false);
        const [hasImageLoaded, setHasImageLoaded] = useState({});;

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
            if (text.length < 3 || text.length > 20) {
                return "部屋名は３～２０文字の範囲で入力してください。";
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
                return;
            }

            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("image", imageFile);
            formData.append("room_name", roomName);

            router.post("/upload", formData, {
                onSuccess: (page) => {
                    setModalData({
                        message: page.props.message,
                        room_name: page.props.room_name,
                        image_url: page.props.image_url,
                    });
                    setShowModal(true);
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    const errorMessages = [
                        errors?.room_name,
                        errors?.image,
                        errors?.message,
                    ].filter(Boolean).join("\n");

                alert(`失敗:\n${errorMessages}`);
                setIsSubmitting(false);
                },
            });
        };

        const [roomCount, setRoomCount] = useState(rooms.length);
            useEffect(() => {
                setRoomCount(rooms.length);
            }, [rooms]);

        const handleImageLoad = (index) => {
            setHasImageLoaded((prevState) => ({
            ...prevState,
            [index]: true,
        }));
    };


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Preparation
                </h2>
            }
        >
            <Head title="Task" />

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <h2>{modalData.message}</h2>
                {modalData.image_url && (
                    <>
                        {!imageLoaded && (
                            <img
                                src={rotateRight}
                                alt="ローディング中..."
                                style={{ width: "50px", height: "50px" }}
                            />
                        )}
                        <img
                            src={modalData.image_url}
                            alt="部屋の画像"
                            style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }}
                            onLoad={() => setImageLoaded(true)}
                        />
                    </>
                )}
                <p>部屋名： {modalData.room_name}</p>
                <SecondaryButton onClick={() => router.get('/preparation')}>
                    追加登録する
                </SecondaryButton>
            </Modal>

            <div>
                <p>新しい部屋を登録しましょう！</p>
                <div>
                    <img src={imageSrc} alt="部屋の写真" style={{ width: "100%", maxWidth: "400px" }} />
                </div>
                <div>
                    <label htmlFor="room_name" className="block text-sm font-medium text-gray-700">
                        部屋の名前
                    </label>
                    <TextInput
                        id="room_name"
                        name="room_name"
                        type="text"
                        className="mt-1 block w-full"
                        placeholder="部屋名を入力してください。"
                        onChange={handleTextChange}
                    />
                </div>
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
                <div>
                    <PrimaryButton onClick={handleSubmit}
                        disabled={isSubmitting || rooms.length >= 4}
                    >
                        {isSubmitting ? "投稿中..." : "投稿"}
                    </PrimaryButton>
                </div>
                {textError && <p className="text-red-500 text-sm mt-1">{textError}</p>}
                {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
                {rooms.length >= 4 && <p className="text-red-500 text-sm mt-1">部屋の登録数は４つまでです。</p>}
            </div>

            <div>
                <h2>登録済みの部屋一覧</h2>
                <ul>
                    {rooms.map((room, index) => (
                        <li key={index}>
                            <p>部屋名: {room.room_name}</p>
                                {!hasImageLoaded[index] && (
                                    <img
                                        src={rotateRight}
                                        alt="ローディング中..."
                                        style={{ width: "50px", height: "50px" }}
                                    />
                                )}
                                    <img 
                                        src={`/rooms/${room.img_name}`} 
                                        alt={room.room_name} 
                                        style={{ width: "150px", borderRadius: "8px", display: hasImageLoaded[index] ? "block" : "none" }} 
                                        onLoad={() => handleImageLoad(index)}
                                    />
                        </li>
                    ))}
                </ul>
            </div>
        </AuthenticatedLayout>
    );
}