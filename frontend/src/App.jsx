import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Dashboard from "./components/Dashboard/Dashboard";
import AllPages from "./components/Pages/AllPages";
import AddPage from "./components/Pages/AddPage";
import EditPage from "./components/Pages/EditPage";
import AllMenuTypes from "./components/MenuTypes/AllMenuTypes";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            {/* CMS Pages Routes */}
            <Route
              path="/cms/pages"
              element={
                <Layout>
                  <AllPages />
                </Layout>
              }
            />
            <Route
              path="/cms/pages/add"
              element={
                <Layout>
                  <AddPage />
                </Layout>
              }
            />
            <Route
              path="/cms/pages/edit/:id"
              element={
                <Layout>
                  <EditPage />
                </Layout>
              }
            />

            {/* Menu Types Routes */}
            <Route
              path="/menu-types"
              element={
                <Layout>
                  <AllMenuTypes />
                </Layout>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;