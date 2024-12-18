import React, { useState, useEffect } from "react";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Label,
    Input,
    Container,
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    CardText,
    CardImg,
    Spinner
} from "reactstrap";

import axios from "axios";
import { useDropzone } from "react-dropzone";

import { getDB } from '../../utils/db';

const FoodItemList = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentFoodItem, setCurrentFoodItem] = useState({});
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [foodItemToDelete, setFoodItemToDelete] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);

    const fetchFoodItems = async () => {
        try {
            const response = await axios.get("/api/foods/food-items");
            const foodItems = response.map(item => {
                item.image = `${process.env.REACT_APP_API_URL}/${item?.image?.replace(/\\/g, '/')}`;
                return item;
            });
            setFoodItems(foodItems);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching food items:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoodItems();
    }, []);


    // Handle image uploads using react-dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: "image/*",
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            setSelectedFile(file);
            setImageUrl(URL.createObjectURL(file));
        },
    });

    useEffect(() => {
        const syncData = async () => {
            try {
                console.log('Starting sync process...');
                const db = await getDB();
                console.log('IndexedDB initialized.');
                const unsyncedData = await db.getAll('unsynced-data-items');
                console.log('Unsynced data retrieved:', unsyncedData);

                for (const item of unsyncedData) {
                    console.log('Syncing item:', item);
                    try {
                        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/foods/sync`, { data: item.content });
                        if (response.status === 200) {
                            console.log('Data synced:', item.content);
                            await db.delete('unsynced-data-items', item.key);
                            console.log('Data deleted from IndexedDB:', item.key);
                            fetchFoodItems();
                        } else {
                            console.error('Failed to sync:', response.status);
                        }
                    } catch (err) {
                        console.error('Error syncing data:', err);
                    }
                }
            } catch (err) {
                console.error('Error accessing IndexedDB:', err);
            }
        };

        // Start sync on coming back online
        window.addEventListener('online', syncData);

        return () => window.removeEventListener('online', syncData);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form's default submit behavior

        const newFoodItem = {
            name: e.target.name.value,
            cost: e.target.cost.value,
            ingredients: e.target.ingredients.value,
            image: selectedFile || (isEdit ? currentFoodItem.image : null), // Handle new or existing image
        };

        try {
            if (isEdit) {
                await axios.put(`/api/foods/food-items/${currentFoodItem.id}`, newFoodItem, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                console.log('Food item updated on server');
            } else {
                await axios.post("/api/foods/food-items", newFoodItem, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                console.log('New food item added to server');
            }
            toggleModal();
            fetchFoodItems();
        } catch (error) {
            console.error('Error handling food item:', error);
            const db = await getDB();
            const unsyncedData = {
                content: newFoodItem,
                isEdit,
                id: isEdit ? currentFoodItem.id : null,
            };
            console.log("data",unsyncedData)
            await db.add('unsynced-data-items', { content: unsyncedData });
            console.log('Data saved offline due to error');
            toggleModal();
        }
    };

    const toggleModal = () => {
        setModal(!modal);
        setCurrentFoodItem({});
        setImageUrl("");
        setSelectedFile(null);
    };


    const handleEdit = (foodItem) => {
        setIsEdit(true);
        setCurrentFoodItem(foodItem);
        setImageUrl(foodItem.image);
        setModal(true);
        setSelectedFile(null);
    };

    const handleDelete = (foodItem) => {
        setFoodItemToDelete(foodItem);
        setConfirmDelete(true);
    };

    const confirmDeletion = async () => {
        try {
            await axios.delete(`/api/foods/food-items/${foodItemToDelete.id}`);
            setFoodItems(foodItems.filter((item) => item.id !== foodItemToDelete.id));
            setConfirmDelete(false);
        } catch (err) {
            console.error("Error deleting food item:", err);
            setConfirmDelete(false);
        }
    };

    const cancelDeletion = () => {
        setConfirmDelete(false);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg={12}>
                            <Card id="foodItemList">
                                <div className="card-header border-0">
                                    <Row className="g-4 align-items-center">
                                        <Col sm>
                                            <h5 className="card-title mb-0">Food Items List</h5>
                                        </Col>
                                        <Col sm="auto">
                                            <button
                                                className="btn btn-success add-btn"
                                                onClick={() => {
                                                    setIsEdit(false);
                                                    toggleModal();
                                                }}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i> Add Food Item
                                            </button>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="card-body pt-0">
                                    {loading ? (
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                                            <Spinner style={{ width: '3rem', height: '3rem' }} color="primary" />
                                            <span className="ms-2">Loading...</span>
                                        </div>
                                    ) : foodItems.length === 0 ? (
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                                            <span>No Data Found</span>
                                        </div>
                                    ) : (
                                        <Row>
                                            {foodItems.map((foodItem, index) => (
                                                <Col md={3} key={foodItem.id} className="mb-4">
                                                    <Card>
                                                        {foodItem.image && (
                                                            <CardImg
                                                                top
                                                                src={foodItem.image}
                                                                alt="Food Item"
                                                                style={{ height: "150px", objectFit: "cover" }}
                                                            />
                                                        )}
                                                        <CardBody className="d-flex flex-column justify-content-between bg-light shadow">
                                                            <div>
                                                                <CardTitle tag="h5">{foodItem.name}</CardTitle>
                                                                <CardText>Cost: ${foodItem.cost}</CardText>
                                                                <CardText>Ingredients: {foodItem.ingredients}</CardText>
                                                            </div>
                                                            <div className="d-flex justify-content-end mt-2">
                                                                <Button
                                                                    color="primary"
                                                                    onClick={() => handleEdit(foodItem)}
                                                                    className="me-2 btn-sm"
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    className="btn-sm"
                                                                    color="danger"
                                                                    onClick={() => handleDelete(foodItem)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                {/* Confirmation Modal for Delete */}
                <Modal isOpen={confirmDelete} toggle={cancelDeletion}>
                    <ModalHeader toggle={cancelDeletion}>Confirm Deletion</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this food item?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={cancelDeletion}>Cancel</Button>
                        <Button color="danger" onClick={confirmDeletion}>Delete</Button>
                    </ModalFooter>
                </Modal>

                {/* Food Item Modal */}
                <Modal isOpen={modal} toggle={toggleModal} size="lg">
                    <ModalHeader toggle={toggleModal}>{isEdit ? "Edit Food Item" : "Add Food Item"}</ModalHeader>
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <Row form>
                                <Col md={6}>
                                    <Label for="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        defaultValue={currentFoodItem.name || ""}
                                        required
                                        className="mb-3"
                                    />
                                </Col>
                                <Col md={6}>
                                    <Label for="cost">Cost $</Label>
                                    <Input
                                        id="cost"
                                        name="cost"
                                        type="number"
                                        defaultValue={currentFoodItem.cost || ""}
                                        required
                                        className="mb-3"
                                    />
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={12}>
                                    <Label for="ingredients">Ingredients</Label>
                                    <Input
                                        id="ingredients"
                                        name="ingredients"
                                        type="textarea"
                                        defaultValue={currentFoodItem.ingredients || ""}
                                        required
                                        className="mb-3"
                                        rows="4"
                                    />
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={12}>
                                    <Label>Image</Label>
                                    <div
                                        {...getRootProps()}
                                        className="border p-4 text-center bg-light shadow-sm"
                                        style={{
                                            borderRadius: "10px",
                                            borderColor: isDragActive ? "green" : "#ccc",
                                            cursor: "pointer",
                                            transition: "border-color 0.3s ease",
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        {imageUrl ? (
                                            <div className="text-center">
                                                <img
                                                    src={imageUrl}
                                                    alt="Preview"
                                                    style={{
                                                        width: "100%",
                                                        maxWidth: "300px",
                                                        maxHeight: "200px",
                                                        objectFit: "cover",
                                                        borderRadius: "10px",
                                                        marginBottom: "15px",
                                                    }}
                                                />
                                            </div>) : (
                                            <div></div>
                                        )}
                                        <p className="mb-0" style={{ color: "#666", fontSize: "14px" }}>
                                            <i className="ri-upload-cloud-line" style={{ fontSize: "24px" }}></i>
                                            <br />
                                            Drag and drop an image here, or <strong>click to select</strong>
                                        </p>
                                    </div>
                                </Col>
                            </Row>
                            <ModalFooter>
                                <Button className="mt-4" color="primary" type="submit">Save</Button>
                                <Button className="mt-4" color="secondary" onClick={toggleModal}>Cancel</Button>
                            </ModalFooter>
                        </form>
                    </ModalBody>
                </Modal>
            </div>
        </React.Fragment>
    );
};

export default FoodItemList;
