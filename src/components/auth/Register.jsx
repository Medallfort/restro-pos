import { useState } from "react";
import { getErrorMessage, register } from "../../https";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

const emptyForm = { name: "", email: "", phone: "", password: "" };

const fields = [
  { name: "name", label: "Name", type: "text", placeholder: "Enter your name" },
  { name: "email", label: "Email", type: "email", placeholder: "Enter your email" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+212 6XX XX XX XX" },
  { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters", minLength: 8 },
];

const Register = ({setIsRegister}) => {
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });
      setFormData(emptyForm);
      setTimeout(() => {
        setIsRegister(false);
      }, 1500);
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error), { variant: "error" });
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {fields.map(({ name, label, ...inputProps }, index) => (
          <div key={name}>
            <label className={`block text-[#ababab] mb-2 ${index > 0 ? "mt-3" : ""} text-sm font-medium`}>
              {label}
            </label>
            <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
                {...inputProps}
              />
            </div>
          </div>
        ))}

        {/* Role kay3tih Admin men Dashboard, machi l-utilisateur */}
        <p className="text-xs text-[#ababab] mt-4">
          New accounts are customer accounts. Staff: sign up, then ask the admin to give you the Waiter or Cashier role.
        </p>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold disabled:opacity-60"
        >
          Sign up
        </button>
      </form>
    </div>
  );
};

export default Register;
