import React from 'react';
import cameraIcon from "../assets/icons/cameraIcon.png";
import folderIcon from "../assets/icons/folderIcon.png";
import cameraAdd from "../assets/icons/camera-add.png";
import folderOpen from "../assets/icons/folder-open.png";

const ImageRegister = ({
    imageSrc,
    cameraSrc,
    handleOpenCamera,
    setCameraSrc,
    fileInputRef,
    handleOpenFolder,
    folderSrc,
    setFolderSrc,
}) => {

    return (
        <div>
            <div>
                <img src={imageSrc} alt="部屋の写真" className="w-full rounded-sm" />
            </div>


            <div className="flex justify-around md:justify-end md:mr-4">
                <div className="md:hidden">
                    <button
                        onClick={handleOpenCamera}
                        onMouseEnter={() => setCameraSrc(cameraAdd)}
                        onMouseLeave={() => setCameraSrc(cameraIcon)}
                    >
                        <img
                            src={cameraSrc}
                            alt="カメラアイコン"
                            style={{ width: '50px', height: '50px' }}
                        />
                    </button>
                </div>

                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleOpenFolder}
                        style={{ display: "none" }}
                        id="fileInput"
                    />
                    <button
                        onClick={() => document.getElementById("fileInput").click()}
                        onMouseEnter={() => setFolderSrc(folderOpen)}
                        onMouseLeave={() => setFolderSrc(folderIcon)}
                    >
                        <img
                            src={folderSrc}
                            alt="フォルダアイコン"
                            style={{ width: '50px', height: '50px' }}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageRegister;