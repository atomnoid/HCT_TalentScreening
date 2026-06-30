import { Link } from "react-router-dom";
import { useState } from "react";

const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  portfolio: "",
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = (e) => {
  e.preventDefault();

  console.log(formData);
};