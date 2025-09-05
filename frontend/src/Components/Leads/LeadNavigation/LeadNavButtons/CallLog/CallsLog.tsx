import React, { useState, useEffect } from 'react';
import { Lead } from "../../../../../services/LeadService";
import CallsLogForm from './CallsLogForm';
import './CallsLog.css';
import CallLogService, { CallLog } from '../../../../../services/CallLogService';

interface CallsButtonProps {
    lead: Lead;
}

const CallsButton: React.FC<CallsButtonProps> = ({ lead }) => {
    const [showForm, setShowForm] = useState(false);
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const date = new Date();
    const [currentCall, setCurrentCall] = useState<CallLog>({
        title: '',
        description: '',
        type: 'INCOMING',
        dateTime: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
        minutes: 0,
        seconds: 0,
        customerName: lead.name,
        employeeName: lead.assignedTo || 'Admin',
        customerEmail: lead.email
    });

 
    useEffect(() => {
        const loadCallLogs = async () => {
            if (!lead) {
                console.log('No lead data available, skipping call logs fetch');
                return;
            }
            
            setLoading(true);
            try {
                let data: CallLog[] = [];
                
                if (lead.email) {
                    console.log(`Fetching call logs for lead email: ${lead.email}`);
                    data = await CallLogService.getCallLogsByCustomerEmail(lead.email);
                }
                
                if (data.length === 0 && lead.id) {
                    console.log(`No logs found by email, trying by ID: ${lead.id}`);
                    data = await CallLogService.getCallLogsByCustomerId(lead.id);
                }
                
                if (data.length === 0 && lead.name) {
                    console.log(`No logs found by ID, trying by name: ${lead.name}`);
                    data = await CallLogService.getCallLogsByCustomerName(lead.name);
                }
                
                console.log('Call logs loaded:', data);
                setCalls(data);
                setError(null);
            } catch (err) {
                console.error('Failed to load call logs:', err);
                setError('Failed to load call logs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        loadCallLogs();
    }, [lead]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const callLogWithEmail = {
                ...currentCall,
                customerEmail: lead.email || currentCall.customerEmail
            };
            
            let savedCall: CallLog;
            
            if (callLogWithEmail.id) {
                console.log('Updating existing call log:', callLogWithEmail);
                savedCall = await CallLogService.updateCallLog(callLogWithEmail.id, callLogWithEmail);
                setCalls(calls.map(call => call.id === savedCall.id ? savedCall : call));
            } else {
                console.log('Creating new call log:', callLogWithEmail);
                savedCall = await CallLogService.createCallLog(callLogWithEmail);
                setCalls([...calls, savedCall]);
            }

            setShowForm(false);
            setCurrentCall({
                title: '',
                description: '',
                type: 'INCOMING',
                dateTime: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
                minutes: 0,
                seconds: 0,
                customerName: lead.name,
                employeeName: lead.assignedTo || 'Admin',
                customerEmail: lead.email
            });
            setError(null);
        } catch (err) {
            console.error('Error saving call log:', err);
            setError('Failed to save call log. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        try {
            console.log('Deleting call log with ID:', id);
            
            await CallLogService.deleteCallLog(id);
            setCalls(calls.filter(call => call.id !== id));
            setError(null);
        } catch (err) {
            console.error('Error deleting call log:', err);
            setError('Failed to delete call log. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (call: CallLog) => {
        
        setCurrentCall({
            ...call,
        });
        setShowForm(true);
    };

    const formatDateDisplay = (dateValue: number[]) => {
        try {
            const [year, month, day, hour, minute] = dateValue;
            console.log('Formatting date:', dateValue);
            
            const date = new Date(year, month - 1, day, hour, minute);
            return date.toLocaleString();
            
        } catch (err) {
            console.error('Error formatting date:', err, dateValue);
            return 'Invalid Date';
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    <i className="bi bi-telephone-fill text-primary me-2"></i>Calls
                </h5>
                <button className="btn btn-sm btn-primary" onClick={() => setShowForm(true)} disabled={loading}>
                    <i className="bi bi-plus-circle-fill me-1"></i> Add Call
                </button>
            </div>

            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {loading && <div className="text-center py-3"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}

                {showForm && (
                    <CallsLogForm
                        currentCall={currentCall}
                        setCurrentCall={setCurrentCall}
                        handleSubmit={handleSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {!loading && calls.length === 0 && !showForm ? (
                    <p className="text-muted text-center">No calls logged for this lead.</p>
                ) : (
                    <div className="call-timeline">
                        {calls.map(call => (
                            <div key={call.id} className="call-item mb-4">
                                <div className="call-content p-3 border rounded shadow-sm bg-white">
                                    <h5 className="text-primary mb-2">
                                        <i className="bi bi-telephone-fill me-2"></i>{call.title}
                                    </h5>
                                    <p className="text-muted"><i className="bi bi-chat-left-text me-2"></i>{call.description}</p>

                                    <div className="mb-2">
                                        <i className="bi bi-arrow-right-circle me-2"></i>
                                        <strong>Type:</strong> {call.type}
                                    </div>

                                    <div className="mb-2">
                                        <i className="bi bi-clock me-2"></i>
                                        <strong>Time:</strong> {formatDateDisplay(call.dateTime)}
                                    </div>

                                    <div className="mb-2">
                                        <i className="bi bi-stopwatch me-2"></i>
                                        <strong>Duration:</strong> {call.minutes}m {call.seconds}s
                                    </div>

                                    <div className="mb-2">
                                        <i className="bi bi-person me-2"></i>
                                        <strong>Customer:</strong> {call.customerName}
                                        {call.customerEmail && <small className="ms-2 text-muted">({call.customerEmail})</small>}
                                    </div>

                                    <div className="mb-3">
                                        <i className="bi bi-person-badge me-2"></i>
                                        <strong>Employee:</strong> {call.employeeName}
                                    </div>

                                    <div className="call-actions d-flex">
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(call)}>
                                            <i className="bi bi-pencil me-1"></i> Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleDelete(call.id!)}>
                                            <i className="bi bi-trash3 me-1"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallsButton;
