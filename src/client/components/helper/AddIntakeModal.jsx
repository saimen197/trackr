import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useMeals } from '../../context/MealContext';

function AddIntakeModal({ isOpen, onConfirm, onCancel }) {
    const { addedMealType } = useMeals();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [intakeType, setIntakeType] = useState('');
    const [served, setServed] = useState('1');

    useEffect(() => {
        setIntakeType(addedMealType);
    }, [addedMealType]);

    const resetFields = () => {
        setSelectedDate(new Date());
        setServed('1');
    }

    const handleConfirm = () => {
        onConfirm(selectedDate, intakeType, served);
        resetFields();
    }

    return (
        <Modal show={isOpen} onHide={onCancel}>
            <Modal.Header>
                <Modal.Title>Add Meal to daily intake</Modal.Title>
                <button type="button" className="btn-close" onClick={() => { onCancel(); resetFields(); }}>&times;</button>
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
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Served</Form.Label>
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
                <Button variant="secondary" onClick={() => { onCancel(); resetFields(); }}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddIntakeModal;
