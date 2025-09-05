import React, { useState, useEffect } from 'react';
import './CallsLog.css';
import { Opportunity } from '../../../OpportunityCard';
import CallLogService, { CallLog, DateTime } from '../../../../../services/CallLogService';
import CallsLogForm from '../../../../Leads/LeadNavigation/LeadNavButtons/CallLog/CallsLogForm';

interface CallsButtonProps {
    opportunity: Opportunity;
}

const CallsButton: React.FC<CallsButtonProps> = ({ opportunity }) => {
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
        customerName: opportunity.lead.name,
        employeeName: opportunity.lead.assignedTo || 'Admin',
    });

    useEffect(() => {
        const loadCallLogs = async () => {
            if (!opportunity || !opportunity.lead) {
                console.log('No opportunity data available, skipping call logs fetch');
                return;
            }
            
            setLoading(true);
            try {
                let data: CallLog[] = [];
                
                if (opportunity.lead.id) {
                    console.log(`Fetching call logs for lead ID: ${opportunity.lead.id}`);
                    data = await CallLogService.getCallLogsByCustomerId(opportunity.lead.id);
                }
                
                if (data.length === 0 && opportunity.id) {
                    console.log(`No logs found by lead ID, trying opportunity ID: ${opportunity.id}`);
                    data = await CallLogService.getCallLogsByCustomerId(opportunity.id);
                }
                
                if (data.length === 0 && opportunity.lead.name) {
                    console.log(`No logs found by IDs, trying by lead name: ${opportunity.lead.name}`);
                    data = await CallLogService.getCallLogsByCustomerName(opportunity.lead.name);
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
    }, [opportunity]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let savedCall: CallLog;
            
            if (currentCall.id) {
                console.log('Updating existing call log:', currentCall);
                savedCall = await CallLogService.updateCallLog(currentCall.id, currentCall);
                setCalls(calls.map(call => call.id === savedCall.id ? savedCall : call));
            } else {
                console.log('Creating new call log:', currentCall);
                savedCall = await CallLogService.createCallLog(currentCall);
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
                customerName: opportunity.lead.name,
                employeeName: opportunity.lead.assignedTo || 'Admin',
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
        setCurrentCall({ ...call });
        setShowForm(true);
    };

    const formatDateDisplay = (dateValue: DateTime) => {
        try {
           
            const [year, month, day, hour, minute] = dateValue;
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
                    <p className="text-muted text-center">No calls logged for this opportunity.</p>
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
