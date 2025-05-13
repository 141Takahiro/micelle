import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from "@inertiajs/react"
import { Head } from '@inertiajs/react';
import cameraIcon from "../assets/icons/cameraIcon.png";
import folderIcon from "../assets/icons/folderIcon.png";
import React, { useState } from "react";
import PrimaryButton from "../Components/PrimaryButton";

export default function Preparation() {
        const defaultImage = "/storage/images/default-image.png";
        const [imageSrc, setImageSrc] = useState(defaultImage);
        const [showSubmitButton, setShowSubmitButton] = useState(false);
        const [imageFile, setImageFile] = useState(null);

        const validateImage = (file) => {
            if (!file) return "ファイルが選択されていません。"
            
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

        const openCamera = () => {
            console.log("カメラアイコンがクリックされました。");
        };

        const handleImageChange = (event) => {
            const file = event.target.files[0];
            const errorMessage = validateImage(file);

            if (errorMessage) {
                alert(errorMessage);
                return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
                setShowSubmitButton(true);
            };
            reader.readAsDataURL(file);
        };

        const handleSubmit = async () => {
            if (!imageFile) {
                console.log("画像が選択されていません。");
                return;
            }

            const formData = new FormData();
            formData.append("image", imageFile);

            router.post("/upload", formData, {
                onSuccess: (page) => {
                    alert(`成功： ${page.props.message}`);
                },
                onError: (errors) => {
                    alert(`失敗： ${errors.props.message}`);
                },
            });
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
            <div>
                <p>新しい部屋を登録しましょう！</p>
                <div>
                    <img src={imageSrc} alt="部屋の写真" style={{ width: "100%", maxWidth: "400px" }} />
                </div>
                <div>
                    <button onClick={openCamera}>
                        <img src={cameraIcon} alt="カメラアイコン" style={{ width: "50px", height: "50px" }} />
                    </button>
                </div>
                <div>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="fileInput" />
                    <button onClick={() => document.getElementById("fileInput").click()}>
                        <img src={folderIcon} alt="フォルダアイコン" style={{ width: "50px", height: "50px" }} />
                    </button>
                </div>

                {showSubmitButton && (
                    <div>
                        <PrimaryButton onClick={handleSubmit}>投稿</PrimaryButton>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}