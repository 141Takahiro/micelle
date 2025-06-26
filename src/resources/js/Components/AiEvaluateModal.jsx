import React from 'react';
import Modal from './Modal'; // Modal コンポーネントのパスに合わせて修正してください
import rotateRight from "../assets/icons/rotate_right.png";

const AiEvaluateModal = ({
    show,
    onClose,
    modalData,
    modalImageLoaded,
    setModalImageLoaded,
}) => {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-semibold">ミセルくんのメッセージ</h2>
                <p>{modalData.updatePhoto_message}</p>

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

                {modalData.score !== null && (
                    <div className="mt-4">
                        <h3 className="text-md font-semibold">スコア</h3>
                        <p className="text-lg font-bold">{modalData.score}点</p>
                    </div>
                )}

                {modalData.micelle_message && (
                    <div className="mt-4">
                        <h3 className="text-md font-semibold">評価メッセージ</h3>
                        <p className="text-md">{modalData.micelle_message}</p>
                    </div>
                )}

                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={onClose}
                >
                    閉じる
                </button>
            </div>
        </Modal>
    );
};

export default AiEvaluateModal;