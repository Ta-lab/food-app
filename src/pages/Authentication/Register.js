import React, { useEffect } from "react";
import { Row, Col, CardBody, Card, Alert, Container, Input, Label, Form, FormFeedback } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// Toast Notification
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Redux Actions
import { registerUser, apiError, resetRegisterFlag } from "../../slices/thunks";

// Redux
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";

// Import images
import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { createSelector } from "reselect";

const Register = () => {
    const history = useNavigate();
    const dispatch = useDispatch();

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: '',
            username: '',
            password: '',
            confirm_password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().required("Please Enter Your Email"),
            username: Yup.string().required("Please Enter Your Username"),
            password: Yup.string()
                .required("Please Enter Your Password")
                .min(8, "Password should be at least 8 characters"),
            confirm_password: Yup.string()
                .required("Please confirm your password")
                .oneOf([Yup.ref("password")], "Passwords must match")
        }),
        onSubmit: (values) => {
            dispatch(registerUser(values));
        }
    });

    useEffect(() => {
        if (validation.errors.password) {
            validation.setFieldError("password", ""); // clear the password error on field change
        }
    }, [validation.values.password]);

    const selectLayoutState = (state) => state.Account;
    const registerData = createSelector(
        selectLayoutState,
        (accountState) => ({
            registrationError: accountState.registrationError,
            success: accountState.success,
            error: accountState.error
        })
    );
    

    const { registrationError, success, error } = useSelector(registerData);

    useEffect(() => {
        dispatch(apiError(""));
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success("Registration Successful! Redirecting to login...");
            setTimeout(() => history("/login"), 3000);
        }
        if (error) {
            toast.error("Email has already been registered. Please use another email.");
        }
        dispatch(resetRegisterFlag());
    }, [dispatch, success, error, history]);

    document.title = "Basic SignUp | Velzon - React Admin & Dashboard Template";

    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/" className="d-inline-block auth-logo">
                                            <img src={logoLight} alt="Logo" height="20" />
                                        </Link>
                                    </div>
                                    <p className="mt-3 fs-15 fw-medium">Premium Admin & Dashboard Template</p>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4">
                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">Create New Account</h5>
                                            <p className="text-muted">Get your free velzon account now</p>
                                        </div>

                                        <Form onSubmit={validation.handleSubmit} className="needs-validation">
                                            {success && (
                                                <Alert color="success">
                                                    Registered Successfully! Redirecting to login page...
                                                </Alert>
                                            )}

                                            {error && (
                                                <Alert color="danger">
                                                    Email has already been registered, please use another email.
                                                </Alert>
                                            )}

                                            <div className="mb-3">
                                                <Label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="Enter email address"
                                                    type="email"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.email || ""}
                                                    invalid={validation.touched.email && validation.errors.email}
                                                />
                                                {validation.touched.email && validation.errors.email && (
                                                    <FormFeedback>{validation.errors.email}</FormFeedback>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <Label htmlFor="username" className="form-label">Username <span className="text-danger">*</span></Label>
                                                <Input
                                                    name="username"
                                                    type="text"
                                                    placeholder="Enter username"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.username || ""}
                                                    invalid={validation.touched.username && validation.errors.username}
                                                />
                                                {validation.touched.username && validation.errors.username && (
                                                    <FormFeedback>{validation.errors.username}</FormFeedback>
                                                )}
                                            </div>

                                            <div className="mb-2">
                                                <Label htmlFor="password" className="form-label">Password <span className="text-danger">*</span></Label>
                                                {/* <Input
                                                    name="password"
                                                    type="text"
                                                    placeholder="Enter Password"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.password || ""}
                                                    invalid={validation.touched.password && validation.errors.password}
                                                /> */}

                                                <Input
                                                    name="password"
                                                    type="password"
                                                    placeholder="Enter Password"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.password || ""}
                                                    invalid={validation.touched.password && validation.errors.password ? true : false}
                                                />


                                                {validation.touched.password && validation.errors.password && (
                                                    <FormFeedback>{validation.errors.password}</FormFeedback>
                                                )}
                                            </div>

                                            <div className="mb-2">
                                                <Label htmlFor="confirm_password" className="form-label">Confirm Password <span className="text-danger">*</span></Label>
                                                <Input
                                                    name="confirm_password"
                                                    type="text"
                                                    placeholder="Confirm Password"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.confirm_password || ""}
                                                    invalid={validation.touched.confirm_password && validation.errors.confirm_password ? true : false}
                                                />
                                                {validation.touched.confirm_password && validation.errors.confirm_password && (
                                                    <FormFeedback>{validation.errors.confirm_password}</FormFeedback>
                                                )}
                                            </div>

                                            <div className="mb-4">
                                                <p className="mb-0 fs-12 text-muted fst-italic">
                                                    By registering you agree to the Velzon
                                                    <Link to="#" className="text-primary text-decoration-underline fst-normal fw-medium">Terms of Use</Link>
                                                </p>
                                            </div>

                                            <div className="mt-4">
                                                <button className="btn btn-success w-100" type="submit">Sign Up</button>
                                            </div>
                                        </Form>
                                    </CardBody>
                                </Card>

                                <div className="mt-4 text-center">
                                    <p className="mb-0">Already have an account? <Link to="/login" className="fw-semibold text-primary text-decoration-underline">Signin</Link></p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>

            <ToastContainer />
        </React.Fragment>
    );
};

export default Register;
