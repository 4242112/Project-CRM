import React from 'react';
import { CallLog, dateToDateTime } from '../../../../../services/CallLogService';

interface CallsLogFormProps {
    currentCall: CallLog;
    setCurrentCall: React.Dispatch<React.SetStateAction<CallLog>>;
    handleSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

const CallsLogForm: React.FC<CallsLogFormProps> = ({
    currentCall,
    setCurrentCall,
    handleSubmit,
    onCancel
}) => {
    return (
        <form onSubmit={handleSubmit} className="card p-4 bg-light mb-4 shadow-sm">
            <h5 className="mb-4">
                <i className="bi bi-journal-plus me-2"></i>
                Add Call Log
            </h5>

            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-type me-2"></i>Title
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={currentCall.title}
                    onChange={(e) => setCurrentCall({ ...currentCall, title: e.target.value })}
                    placeholder="Enter call title"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-chat-text me-2"></i>Description
                </label>
                <textarea
                    className="form-control"
                    value={currentCall.description}
                    onChange={(e) => setCurrentCall({ ...currentCall, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                ></textarea>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-telephone me-2"></i>Call Type
                </label>
                <select
                    className="form-select"
                    value={currentCall.type}
                    onChange={(e) => setCurrentCall({ ...currentCall, type: e.target.value as CallLog['type'] })}
                    required
                >
                    <option value="INCOMING">Incoming</option>
                    <option value="OUTGOING">Outgoing</option>
                    <option value="MISSED">Missed</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-calendar-event me-2"></i>Date & Time
                </label>
                <input
                    type="datetime-local"
                    className="form-control"
                    value={Array.isArray(currentCall.dateTime) ? 
                        `${currentCall.dateTime[0]}-${String(currentCall.dateTime[1]).padStart(2, '0')}-${String(currentCall.dateTime[2]).padStart(2, '0')}T${String(currentCall.dateTime[3]).padStart(2, '0')}:${String(currentCall.dateTime[4]).padStart(2, '0')}` 
                        : ''}
                    onChange={(e) => setCurrentCall({ ...currentCall, dateTime: dateToDateTime(new Date(e.target.value)) })}
                    required
                />
            </div>

            <div className="row mb-3">
                <div className="col">
                    <label className="form-label">
                        <i className="bi bi-stopwatch me-2"></i>Minutes
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        value={currentCall.minutes}
                        onChange={(e) => setCurrentCall({ ...currentCall, minutes: parseInt(e.target.value) || 0 })}
                        min={0}
                        required
                    />
                </div>
                <div className="col">
                    <label className="form-label">
                        <i className="bi bi-stopwatch-fill me-2"></i>Seconds
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        value={currentCall.seconds}
                        onChange={(e) => setCurrentCall({ ...currentCall, seconds: parseInt(e.target.value) || 0 })}
                        min={0}
                        max={59}
                        required
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-person me-2"></i>Customer Name (Lead)
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={currentCall.customerName}
                    disabled
                    readOnly
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-person-badge me-2"></i>Employee Name (Assigned To)
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={currentCall.employeeName}
                    disabled
                    readOnly
                />
            </div>

            <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                    <i className="bi bi-check2-circle me-1"></i> Save
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                    <i className="bi bi-x-circle me-1"></i> Cancel
                </button>
            </div>
        </form>
    );
};

export default CallsLogForm;
