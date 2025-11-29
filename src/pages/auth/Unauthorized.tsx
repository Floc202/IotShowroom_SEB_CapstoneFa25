import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="max-w-lg mx-auto text-center space-y-4 mt-40 mb-40">
      <h1 className="text-2xl font-bold text-red-600">
        Bạn không có thẩm quyền để vào trang này
      </h1>
      <p className="text-gray-600">Vui lòng nhấn để quay về lại trang chính.</p>
      <Link to="/" className="text-white bg-blue-600 px-4 py-2 rounded">
        Về trang chủ
      </Link>
    </div>
  );
}
