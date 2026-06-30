import { Link } from "react-router-dom";

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