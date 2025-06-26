import React from 'react';
import Modal from './Modal';
import ImageRegister from './ImageRegister';
import PrimaryButton from './PrimaryButton';


const ImageUpdateModal = ({
  isModalOpen,
  setIsModalOpen,
  selectedRoomId,
  setSelectedRoomId,
  rooms,
  imageSrc,
  cameraSrc,
  handleOpenCamera,
  setCameraSrc,
  fileInputRef,
  handleOpenFolder,
  folderSrc,
  setFolderSrc,
  handleSubmit,
  isSubmitting,
  imageError,
  currentRoom,
}) => {
  return (
    <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <div className="p-4">
        <div className="flex flex-col">
          <label className="text-sm font-bold">部屋を選択：</label>
          <select
            className="p-2 border rounded mt-2"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(Number(e.target.value))}
          >
            {rooms.map((room) => (
              <option key={room.id} value={String(room.id)}>
                {room.room_name}
              </option>
            ))}
          </select>

          {currentRoom && (
            <h2 className="text-xl text-center my-4">
              「{currentRoom.room_name}」の写真を更新しましょう！
            </h2>
          )}

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
            <PrimaryButton
              onClick={handleSubmit}
              disabled={isSubmitting || imageError}
              className="my-2"
            >
              {isSubmitting ? "投稿中..." : "投稿"}
            </PrimaryButton>
          </div>
          {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default ImageUpdateModal;