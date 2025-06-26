// resources/js/Components/DeleteModal.jsx
import React from 'react';
import Modal from './Modal';

const DeleteModal = ({ show, deleteMessage, onClose }) => {
  return (
    <Modal show={show} onClose={onClose} title="削除完了">
      <p className="font-semibold text-center m-4">
        {deleteMessage}
      </p>
    </Modal>
  );
};

export default DeleteModal;
