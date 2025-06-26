import React from 'react';

const MicelleEvaluateCard = ({
    allCompleted,
    hasAiEvaluate,
    micelleEvaluateImage,
    setIsModalOpen,
}) => {
    return (
        <div
            className={`flex justify-center border-2 border-solid rounded-sm m-2 shadow-xl transition duration-300 ease-in-out h-auto md:w-full
        ${allCompleted && !hasAiEvaluate ? "border-4 border-red-500 bg-red-500" : ""}`}
        >
            <img
                src={micelleEvaluateImage}
                alt="ミセル判定画像"
                className={`h-auto w-auto m-4 transition ease-in-out hover:scale-105 hover:border-4 hover:border-blue-500 rounded
          ${allCompleted && !hasAiEvaluate ? "border-4 border-red-500" : ""}`}
                onClick={() => setIsModalOpen(true)}
            />
        </div>
    );
};

export default MicelleEvaluateCard;