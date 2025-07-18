import React, { useEffect, useState } from "react";
import SortableTree from "@nosferatu500/react-sortable-tree";
import "@nosferatu500/react-sortable-tree/style.css";
import { useDragDropManager } from "react-dnd"; // 👈 use DnD context
import { menuTypeAPI, cmsPageAPI } from "../../services/api";

const ReorderPages = () => {
  const [menuTypes, setMenuTypes] = useState([]);
  const [selectedMenuType, setSelectedMenuType] = useState("");
  const [treeData, setTreeData] = useState([]);
  const dndManager = useDragDropManager(); // 👈 inject global drag-drop context

  useEffect(() => {
    const fetchMenuTypes = async () => {
      try {
        const res = await menuTypeAPI.getAll();
        if (Array.isArray(res)) setMenuTypes(res);
        else if (res?.data && Array.isArray(res.data)) setMenuTypes(res.data);
      } catch (err) {
        console.error("Failed to load menu types:", err);
      }
    };
    fetchMenuTypes();
  }, []);

  const handleMenuChange = async (e) => {
    const menuId = e.target.value;
    setSelectedMenuType(menuId);
    if (!menuId) return;

    try {
      const res = await cmsPageAPI.getTreeByMenuType(menuId);
      if (Array.isArray(res)) setTreeData(res);
      else if (res?.data && Array.isArray(res.data)) setTreeData(res.data);
    } catch (err) {
      console.error("Failed to load tree:", err);
    }
  };

  const handleSave = async () => {
    try {
      await cmsPageAPI.reorder(treeData);
      alert("Order saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save order.");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Reorder Pages</h2>

      <label className="block font-medium mb-2">Select Menu Type</label>
      <select
        className="border p-2 w-full mb-4"
        value={selectedMenuType}
        onChange={handleMenuChange}
      >
        <option value="">-- Select Menu --</option>
        {Array.isArray(menuTypes) &&
          menuTypes.map((menu) => (
            <option key={menu._id} value={menu._id}>
              {menu.name}
            </option>
          ))}
      </select>

      {treeData.length > 0 && (
        <>
          <div style={{ height: 500 }}>
            <SortableTree
              treeData={treeData}
              onChange={setTreeData}
              dndManager={dndManager} // ✅ fix for backend conflict
            />
          </div>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSave}
          >
            Save Order
          </button>
        </>
      )}
    </div>
  );
};

export default ReorderPages;
