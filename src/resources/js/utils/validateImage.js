const validateImage = (file) => {
  if (!file) {
    return "ファイルが選択されていません。";
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (!allowedTypes.includes(file.type)) {
    return "許可されていないファイル形式です。JPEG, PNG, JPGのみアップロードできます。";
  }
  if (file.size > maxSize) {
    return "ファイルサイズが２ＭＢを超えています。";
  }
  return null;
};

export default validateImage;