import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, confirmLabel = "Delete" }) {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="small">
      <div className="confirm-dialog-content">
        <div className="confirm-dialog-icon"><AlertTriangle size={26} /></div>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="button secondary" onClick={onCancel}>Cancel</button>
          <button className="button danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}
