import React, { useState, useEffect } from 'react';
import Modal from './Modal'; 
import PrimaryButton from './PrimaryButton'; 
import { router } from "@inertiajs/react"
import rotateRight from "../assets/icons/rotate_right.png";

const PreparationModal = ({ show, onClose, modalData }) => {
  const [modalImageLoaded, setModalImageLoaded] = useState(false);

  useEffect(() => {
    if (show) {
      setModalImageLoaded(false);
    }
  }, [show, modalData.image_url]);

  return (
    <Modal show={show} onClose={onClose} className="flex flex-col">
      <h2 className="text-center m-4">{modalData.store_message}</h2>
      {modalData.image_url && (
        <>
          {!modalImageLoaded && (
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
              src={modalData.image_url}
              alt="部屋の画像"
              className="md:max-h-[32rem] object-cover rounded-sm"
              onLoad={() => setModalImageLoaded(true)}
            />
          </div>
        </>
      )}
      <div className="flex justify-around">
        <PrimaryButton onClick={onClose} className="m-2">
          部屋を追加する
        </PrimaryButton>
        <PrimaryButton onClick={() => router.visit('/task')} className="m-2">
          タスクを登録する
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default PreparationModal;