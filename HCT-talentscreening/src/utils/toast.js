import toast from "react-hot-toast";

export function showSuccess(message) {
  return toast.success(message);
}

export function showError(message) {
  return toast.error(message);
}

export function showInfo(message) {
  return toast(message);
}
