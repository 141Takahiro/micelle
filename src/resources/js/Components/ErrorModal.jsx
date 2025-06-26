import React from 'react';
import Modal from './Modal';

const ErrorModal = ({ show, errorMessage, onClose }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <p className="font-semibold text-center m-4">{errorMessage}</p>
    </Modal>
  );
};

export default ErrorModal;
