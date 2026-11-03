import { X } from 'lucide-react';
export default function Modal({ title, onClose, children, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className={`modal ${wide ? 'modal-wide' : ''}`}><header className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button></header>{children}</section></div>;
}
