import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import {
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    Modal,
    Form,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Label,
    Input,
    Button,
    Spinner
} from "reactstrap";

import TableContainerReactTable from "../../Components/Common/TableContainerReactTable";

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState({});

    const [loading, setLoading] = useState(true);

    const [modalDelete, setModalDelete] = useState(false);
    const [customerIdToDelete, setCustomerIdToDelete] = useState(null);

    const toggleModalDelete = () => setModalDelete(!modalDelete);

    const handleDelete = (customerId) => {
        console.log("handle delete", customerId)
        // Set the customer ID to be deleted and open the confirmation modal
        setCustomerIdToDelete(customerId);
        toggleModalDelete();
    };


    const fetchCustomers = async () => {
        try {
            const response = await axios.get("/api/customers"); // Replace with actual API
            setCustomers(response.customers); // Assuming response contains an array of customers
            setLoading(false);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setLoading(false);
        }
    };

    // Fetching customer data from API
    useEffect(() => {
        fetchCustomers();
    }, []);


    // Columns configuration for TableContainer
    const columns = useMemo(
        () => [
            {
                id: "sno", // Add an 'id' field for the column
                Header: "S.No", // Serial Number header
                Cell: (cellProps) => {
                    // Here we calculate the serial number based on the row index
                    return cellProps.row.index + 1;  // Adding 1 to make it 1-based
                }
            },
            {
                id: "name", // Add an 'id' field for the column
                Header: "Customer",
                accessor: "name",
            },
            {
                id: "email", // Add an 'id' field for the column
                Header: "Email",
                accessor: "email",
            },
            {
                id: "phone", // Add an 'id' field for the column
                Header: "Phone",
                accessor: "phone",
            },
            {
                id: "address", // Add an 'id' field for the column
                Header: "Address",
                accessor: "address",
            },
            {
                id: "action", // Add an 'id' field for the column
                Header: "Action",
                Cell: (cellProps) => (
                    <ul className="list-inline hstack gap-2 mb-0">
                        <li className="list-inline-item edit" title="Edit">
                            <Link
                                to="#"
                                className="text-primary d-inline-block edit-item-btn"
                                onClick={() => handleEdit(cellProps.row.original)}
                            >
                                <i className="ri-pencil-fill fs-16"></i>
                            </Link>
                        </li>
                        <li className="list-inline-item" title="Remove">
                            <Link
                                to="#"
                                className="text-danger d-inline-block remove-item-btn"
                                onClick={() => handleDelete(cellProps.row.original.id)}
                            >
                                <i className="ri-delete-bin-5-fill fs-16"></i>
                            </Link>
                        </li>
                    </ul>
                ),
            }
        ],
        []
    );

    // Open modal for editing or adding customer
    const toggleModal = () => {
        setModal(!modal);
        setCurrentCustomer({});
    };

    const handleEdit = (customer) => {
        setIsEdit(true);
        toggleModal();  // Open modal in edit mode
        setCurrentCustomer(customer);
    };

    const confirmDelete = () => {

        console.log("custid", customerIdToDelete);

        axios.delete(`/api/customers/delete/${customerIdToDelete}`)
            .then(() => {
                toggleModalDelete();  // Close modal after submit
                fetchCustomers();
            })
            .catch(err => {
                console.error("Error deleting customer:", err);
            });
    };

    const cancelDelete = () => {
        toggleModalDelete();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newCustomer = {
            name: e.target.customerName.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            address: e.target.address.value
        };

        if (isEdit) {
            // Edit customer
            axios.put(`/api/customers/update/${currentCustomer.id}`, newCustomer)
                .then((response) => {
                    toggleModal();  // Close modal after submit
                    fetchCustomers();
                })
                .catch((err) => {
                    console.error("Error editing customer:", err);
                });
        } else {
            // Add new customer
            axios.post("/api/customers/create", newCustomer)
                .then((response) => {
                    console.log("response", response)
                    toggleModal();  // Close modal after submit
                    fetchCustomers();

                })
                .catch((err) => {
                    console.error("Error adding customer:", err);
                });
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg={12}>
                            <Card id="customerList">
                                <CardHeader className="border-0">
                                    <Row className="g-4 align-items-center">
                                        <Col sm>
                                            <h5 className="card-title mb-0">Customer List</h5>
                                        </Col>
                                        <Col sm="auto">
                                            <button
                                                className="btn btn-success add-btn"
                                                onClick={() => {
                                                    setIsEdit(false);
                                                    toggleModal();
                                                }}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i> Add Customer
                                            </button>
                                        </Col>
                                    </Row>
                                </CardHeader>

                                <div className="card-body pt-0">
                                    {loading ? (
                                        // Loading Spinner
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                                            <Spinner style={{ width: '3rem', height: '3rem' }} color="primary" />
                                            <span className="ms-2">Loading...</span>
                                        </div>
                                    ) : customers.length === 0 ? (
                                        // No data found
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                                            <span>No Data Found</span>
                                        </div>
                                    ) : (
                                        <TableContainerReactTable
                                            columns={columns}
                                            data={customers}
                                            isGlobalFilter={true}
                                            isPagination={true}
                                            customPageSize={10}
                                            theadClass="table-light text-muted"
                                            SearchPlaceholder="Search..."
                                        />
                                    )}
                                    
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>


                <Modal id="showModal" isOpen={modal} toggle={toggleModal} centered>
                    <ModalHeader className="bg-light p-3" toggle={toggleModal}>
                        {isEdit ? "Edit Customer" : "Add Customer"}
                    </ModalHeader>
                    <Form onSubmit={handleSubmit}>
                        <ModalBody>
                            <div className="mb-3">
                                <Label htmlFor="customername-field" className="form-label">Customer Name</Label>
                                <Input
                                    name="customerName"
                                    id="customername-field"
                                    className="form-control"
                                    placeholder="Enter Name"
                                    type="text"
                                    defaultValue={currentCustomer.name || ''}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <Label htmlFor="email-field" className="form-label">Email</Label>
                                <Input
                                    name="email"
                                    id="email-field"
                                    className="form-control"
                                    placeholder="Enter Email"
                                    type="email"
                                    defaultValue={currentCustomer.email || ''}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <Label htmlFor="phone-field" className="form-label">Phone</Label>
                                <Input
                                    name="phone"
                                    id="phone-field"
                                    className="form-control"
                                    placeholder="Enter Phone"
                                    type="text"
                                    defaultValue={currentCustomer.phone || ''}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <Label htmlFor="address-field" className="form-label">Address</Label>
                                <Input
                                    name="address"
                                    id="address-field"
                                    className="form-control"
                                    placeholder="Enter Address"
                                    type="text"
                                    defaultValue={currentCustomer.address || ''}
                                    required
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <button type="button" className="btn btn-light" onClick={toggleModal}>Close</button>
                            <button type="submit" className="btn btn-success">Save</button>
                        </ModalFooter>
                    </Form>
                </Modal>



                {/* Custom Confirmation Modal */}
                <Modal isOpen={modalDelete} toggle={toggleModalDelete}>
                    <ModalHeader toggle={toggleModalDelete}>Confirm Deletion</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this customer? This action cannot be undone.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={cancelDelete}>Cancel</Button>
                        <Button color="danger" onClick={confirmDelete}>Delete</Button>
                    </ModalFooter>
                </Modal>


            </div>
        </React.Fragment>
    );
};

export default CustomerList;