import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function AddIntakeModal({ isOpen, onConfirm, onCancel }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [intakeType, setIntakeType] = useState(''); 
    const [served, setServed] = useState('1'); 

    const handleConfirm = () => {
        onConfirm(selectedDate, intakeType, served);
    }

    return (
        <Modal show={isOpen} onHide={onCancel}>
            <Modal.Header>
                <Modal.Title>Add Meal to daily intake</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Select Date and Time</Form.Label>
                    <Form.Control 
                        type="datetime-local"
                        value={selectedDate.toISOString().substr(0, 16)} 
                        onChange={(e) => setSelectedDate(new Date(e.target.value))} 
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Select intake type</Form.Label>
                    <Form.Select 
                        value={intakeType} 
                        onChange={(e) => setIntakeType(e.target.value)}
                    >
                        <option value="" disabled>Select intake type...</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Number of servings</Form.Label>
                    <Form.Control 
                        type="number"
                        min="1"
                        value={served}
                        onChange={(e) => setServed(e.target.value)} 
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleConfirm} disabled={!intakeType}>Add to intake</Button>
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddIntakeModal;
