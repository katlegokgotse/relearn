"use client";

import { useState } from "react";

const Authentication = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const endpoint = isSignIn ? "/auth/login" : "/auth/registration";
    const payload = isSignIn
      ? { email: formData.email, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage =
          response.status === 404
            ? "Endpoint not found"
            : "An unexpected error occurred";
        throw new Error(errorMessage);
      }

      // Check if the response is JSON before parsing
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setSuccess(data.message || "Success!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during submission");
    }
  };

  return (
    <div className="flex h-screen font-inter">
      {/* Left Side */}
      <div className="w-1/2 bg-blue-600 flex flex-col justify-center items-center text-white">
        <div className="mb-8">
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG content */}
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-4">Explore the app</h1>
        <p className="text-center">
          Have your finances in one place and always under control
        </p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold mb-8 text-center">
            App's name
          </h1>
          <div className="flex mb-4">
            <button
              onClick={() => setIsSignIn(true)}
              className={`w-1/2 py-2 text-center border-b-2 ${
                isSignIn ? "border-black" : "border-gray-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`w-1/2 py-2 text-center border-b-2 ${
                !isSignIn ? "border-black" : "border-gray-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!isSignIn && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="username"
                  type="text"
                  placeholder="Your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {!isSignIn && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="mb-4 text-right">
              {isSignIn ? (
                <a href="#" className="text-sm text-gray-600">
                  Forgot password?
                </a>
              ) : null}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded"
            >
              {isSignIn ? "Sign In" : "Sign Up"}
            </button>

            {error && <p className="text-red-500 mt-4">{error}</p>}
            {success && <p className="text-green-500 mt-4">{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
