import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SortableTree from "@nosferatu500/react-sortable-tree";
import "@nosferatu500/react-sortable-tree/style.css";
import { useDragDropManager } from "react-dnd"; // 👈 use DnD context
import { menuTypeAPI, cmsPageAPI } from "../../services/api";

const ReorderPages = () => {
  const [menuTypes, setMenuTypes] = useState([]);
  const [selectedMenuType, setSelectedMenuType] = useState("");
  const [treeData, setTreeData] = useState([]);
  const dndManager = useDragDropManager(); // 👈 inject global drag-drop context

  useEffect(() => {                                 // runs only once on component mount (because of empty dependency array []).
    const fetchMenuTypes = async () => {            //async function fetchMenuTypes that Calls menuTypeAPI.getAll() — an API call that fetches all menu types from the backend
      try {
        const res = await menuTypeAPI.getAll();
        if (Array.isArray(res)) setMenuTypes(res);  //There are two possible formats of the API response: If res itself is an array, directly store it in setMenuTypes.& If response is like { data: [...] }, extract the array from res.data and store it in setMenuTypes.
        else if (res?.data && Array.isArray(res.data)) setMenuTypes(res.data);
      } catch (err) {
        console.error("Failed to load menu types:", err);
      }
    };
    fetchMenuTypes();                               // Call the function to fetch menu types when the component mounts
  }, []);                                           // Empty dependency array means this effect runs only once( this ensures menu types are fetched once and stored in a local state variable (e.g., menuTypes), which is likely used in a dropdown.)

  // This function is typically triggered when a user selects a menu type (e.g., "Main Menu", "Footer", etc.) from a dropdown.
  const handleMenuChange = async (e) => {           //This is an event handler for a dropdown/select input. It’s triggered when the user changes the selected menu type.
    const menuId = e.target.value;                  //e.target.value gets the selected menu type's ID
    setSelectedMenuType(menuId);                    //store it in selectedMenuType state — this helps you know which menu is currently selected elsewhere in your component.
    if (!menuId) return;                            //If no menu type is selected (empty string or null), the function stops here. This prevents making unnecessary API calls.

    try {
      const res = await cmsPageAPI.getTreeByMenuType(menuId);      //cmsPageAPI.getTreeByMenuType(menuId) calls an API endpoint like: GET /cms/pages/tree/:menuTypeId  This fetches a nested (recursive) tree structure of CMS pages for the selected menu type.
      if (Array.isArray(res)) setTreeData(res);                    // If the response is an array, it directly sets the treeData state with this array.
      else if (res?.data && Array.isArray(res.data)) setTreeData(res.data); // If the response is an object with a data property that is an array, it extracts that array and sets it as treeData.
    } catch (err) {
      console.error("Failed to load tree:", err);
    }
  };

  const handleSave = async () => {                 //Defines an asynchronous function, typically triggered by a Save button
    try {
      await cmsPageAPI.reorder(treeData);          //Sends the current tree structure (treeData) to the API to update the page order and hierarchy in the database.
      toast.success("Order saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save order.");
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
        {Array.isArray(menuTypes) &&                            //Checks if menuTypes is an array before trying to .map() over it. Prevents runtime errors if menuTypes is null, undefined, or some other type.
          menuTypes.map((menu) => (                             //Loops over each item in menuTypes. menu represents a single object like: {_id: "64e91d...",name: "Header"}
            <option key={menu._id} value={menu._id}>            {/* Creates a dropdown <option> element: key={menu._id} is for React's internal tracking. value={menu._id} is the actual value submitted if this option is selected. */}      
              {menu.name}                                       {/*{menu.name} is the text shown to the user.*/}
            </option>
          ))}
      </select>

      {/* This JSX snippet displays a drag-and-drop sortable tree UI only when there’s data in treeData, and provides a "Save Order" button. */}
      {treeData.length > 0 && (                //Ensures this block only renders if treeData has elements (i.e., some pages are loaded).
        <>
          <div style={{ height: 500 }}>      
            <SortableTree                     //Component from [@nosferatu500/react-sortable-tree] that renders a drag-and-drop tree UI.
              treeData={treeData}             //Data structure representing the page hierarchy.
              onChange={setTreeData}          //Updates the state when the user drags and reorders nodes.    
              dndManager={dndManager}         //fix for backend drag-and-drop conflicts (used when integrating with other drag/drop systems).
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