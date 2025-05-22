
const baseURL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GptIcon } from '../../assets';
import instance from '../../config/instance';
import { personaTypes, usStates } from '../../config/personas';
import './style.scss';

const RegisterPendings = ({ _id }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    companyType: '',
    personaType: 'Agent',
    address1: '',
    address2: '',
    zipcode: '',
    state: '',
    phone: ''
  });

  const validateForm = () => {
    const { fName, lName, companyType, address1, zipcode, state, phone } = formData;
    return (
      fName.trim() &&
      lName.trim() &&
      companyType.trim() &&
      address1.trim() &&
      zipcode.trim().length === 5 &&
      state &&
      /^(?:\+1\s?)?\(?([2-9][0-9]{2})\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/.test(phone)
    );
  };

  const formHandle = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      let res = null;
      try {
        res = await instance.put(`${baseURL}/api/user/signup-finish`, {
          ...formData,
          _id
        });
      } catch (err) {
        console.log(err);
        if (err?.response?.data?.status === 422) {
          alert("Already Registered");
          navigate('/login');
        } else {
          alert(err);
        }
      } finally {
        if (res?.data?.status === 208) {
          navigate('/');
        } else if (res) {
          navigate('/login');
        }
      }
    } else {
      alert("Please fill in all required fields correctly.");
    }
  };

  return (
    <div className='Contain'>
      <div className='icon'>
        <GptIcon />
      </div>

      <h1>Tell us about you</h1>

      <form className="pendings" onSubmit={formHandle}>
        <div className="fullName register-field-row">
          <input className="register-field" type="text" placeholder="First name" value={formData.fName}
            onChange={(e) => setFormData({ ...formData, fName: e.target.value })} />
          <input className="register-field" type="text" placeholder="Last name" value={formData.lName}
            onChange={(e) => setFormData({ ...formData, lName: e.target.value })} />
        </div>

        <div className="register-field-row">
          <input className="register-field company-type-input" type="text" placeholder="Company Type"
            value={formData.companyType}
            onChange={(e) => setFormData({ ...formData, companyType: e.target.value })} />
          <select className="register-field persona-type-select"
            value={formData.personaType}
            onChange={(e) => setFormData({ ...formData, personaType: e.target.value })}>
            {personaTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="register-field-row">
          <input className="register-field address-line1-input" type="text" placeholder="Address Line 1"
            value={formData.address1}
            onChange={(e) => setFormData({ ...formData, address1: e.target.value })} />
          <input className="register-field address-line2-input" type="text" placeholder="Address Line 2"
            value={formData.address2}
            onChange={(e) => setFormData({ ...formData, address2: e.target.value })} />
        </div>

        <div className="register-field-row">
          <input className="register-field zipcode-input" type="number" placeholder="Zip Code"
            value={formData.zipcode}
            onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })} />
          <select className="register-field state-select"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}>
            <option value="">Select State</option>
            {Object.entries(usStates).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>{name}</option>
            ))}
          </select>
        </div>

        <div className="register-field-row">
          <input className="register-field phone-input" type="tel" placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>

        <button type='submit'>Continue</button>

        <div>
          <p>By clicking "Continue", you agree to our <span>Terms</span>, <br /><span>Privacy policy</span> and confirm you're 18 years or older.</p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPendings;
