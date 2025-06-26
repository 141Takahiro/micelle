export const validateText = (text) => {

  if (!text.trim()) {
    return "部屋名を入力してください。";
  }

  if (text.length < 2 || text.length > 20) {
    return "部屋名は２～２０文字の範囲で入力してください。";
  }
  return null;
};

export default validateText;