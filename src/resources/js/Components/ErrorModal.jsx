import React from 'react';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';

const ErrorModal = ({ show, errorMessage, onClose }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <p className="font-semibold text-center m-4">{errorMessage}</p>
      <div className="flex justify-center my-4">
        <PrimaryButton onClick={onClose}>
          閉じる
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default ErrorModal;
