const CMSPage = require("../models/CMSPage");
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

// Get all CMS pages
const getAllPages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      menuType = "",
      enabled = "",
    } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { pageTitle: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    // Menu type filter
    if (menuType) {                             //If the user passes a menuType (like "Top Menu", "Footer", etc.), then we add it to our query
      query.menuType = menuType;
    }

    // Enabled filter
    if (enabled !== "") {                      //If the enabled filter is not empty, It checks if the value is "true" or "false"
      query.isEnabled = enabled === "true";    //Then it sets query.isEnabled to either true or false accordingly in query
    }                                          //This is useful when filtering, Show only enabled pages, Or only disabled pages

    const pages = await CMSPage.find(query)    //Find all pages that match the query
      .populate("menuType", "name")            //This joins data from another collection (MenuType) where the menuType field is a reference (ObjectId).It replaces the ID with the actual name (like "Top Menu")
      .populate("parentId", "pageTitle")       //Same as above: replaces the parentId (which refers to another page) with the pageTitle of that parent.
      .sort({ orderId: 1, createdAt: -1 })     //Sorts the results in two ways, First by orderId in ascending order, Then, for items with the same orderId, by createdAt in descending order
      .limit(limit * 1)                        //Limits how many results to return
      .skip((page - 1) * limit);               //Skips results to apply pagination(If page = 2 and limit = 10, it skips the first 10 records)

    const total = await CMSPage.countDocuments(query);     //This tells us how many total pages match the current filters

    res.json({
      success: true,                          //Indicates the request was successful
      data: pages,                            //Returns the actual CMS pages fetched from the database.
      pagination: {                           //Sends pagination information to help the frontend build page buttons, etc.
        current: parseInt(page),              //Converts the page (usually a string from the URL) into a number(Tells which page number the user is currently on)
        pages: Math.ceil(total / limit),      //Calculates the total number of pages
        total,
        limit: parseInt(limit),               //Converts the limit (usually a string from the URL) into a number
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pages",
      error: error.message,
    });
  }
};

// Get page by ID 
const getPageById = async (req, res) => {                //To fetch a single CMS page from the database by its unique ID and return its data in the response.
  try {
    const page = await CMSPage.findById(req.params.id)
      .populate("menuType", "name")                     //Replaces the menuType ObjectId with the actual object — only the name field
      .populate("parentId", "pageTitle");               //Replaces the parentId (if it's a subpage) with the pageTitle of its parent page.

    if (!page) {
      return res.status(404).json({                     //If no page is found with the given ID, it returns a 404 error
        success: false,
        message: "Page not found",
      });
    }

    res.json({                                         //If the page is found, it returns the page data
      success: true,
      data: page,                    // the actual page data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching page",
      error: error.message,
    });
  }
};

// Create page
const createPage = async (req, res) => {                //This function is used to create a new CMS page and save it to the database.
  try {
    const errors = validationResult(req);               //validationResult(req) is used to check if any express-validator rules failed.
    if (!errors.isEmpty()) {                            //If there are validation errors:
      return res.status(400).json({                     //It returns a 400 Bad Request with error details(Example: If a required field like pageTitle is missing)
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    // Set the highest order ID + 1
    const maxOrder = await CMSPage.findOne().sort({ orderId: -1 });    //Finds the page with the highest orderId in the collection
    const orderId = maxOrder ? maxOrder.orderId + 1 : 1;               //Sets the new page's orderId to next available number/If no pages exist, orderId becomes 1.

    const pageData = {                           //Combines form data (req.body) with:orderId (calculated above)& createdBy and updatedBy
      ...req.body,
      orderId,
      createdBy: "Admin",  // You can get this from authentication
      updatedBy: "Admin",
    };

    // Handle file upload
    if (req.file) {                                           //This block only runs if a file was uploaded
      pageData.hasFile = true;                                //A boolean flag to indicate that this page has a file attached.
      pageData.fileName = req.file.filename;                  //The file name is set to the filename generated by multer (the file upload middleware)
      pageData.originalFileName = req.file.originalname;      //The original file name uploaded by the user,
      pageData.fileSize = req.file.size;                      //The size of the uploaded file in bytes
      pageData.fileMimeType = req.file.mimetype;              //The MIME type of the uploaded file (like "image/png", "application/pdf", etc.)
      pageData.filePath = req.file.path;                      //The path where the file is stored on the server(e.g., "uploads/brochure-...pdf")
      // Set URL to file access endpoint
      pageData.url = `/api/cms-pages/file/${req.file.filename}`; // This sets the URL to access the file later, so the frontend can download or view it.
    }

    const page = new CMSPage(pageData);                     //Creates a new instance(page) of CMSPage
    await page.save();                                      //Saves the new page to the database

    // Update the URL with the actual page ID
    if (req.file) {
      page.url = `/api/cms-pages/file/${page._id}`;
      await page.save();
    }
   
    const populatedPage = await CMSPage.findById(page._id)  //After saving, fetch the same page again, but with menuType parentId
      .populate("menuType", "name")                         //menuType populated (showing name instead of ObjectId)
      .populate("parentId", "pageTitle");                   //parentId populated (showing parent page title)

    res.status(201).json({
      success: true,
      message: "Page created successfully",
      data: populatedPage,
    });
  } catch (error) {
    // Clean up uploaded file if page creation fails
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists. Please choose a different slug.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating page",
      error: error.message,
    });
  }
};

// Update page
const updatePage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const existingPage = await CMSPage.findById(req.params.id);
    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: "Admin", // You can get this from authentication
    };

    // Handle file upload, This block handles updating a CMS page's file — specifically when a new file is uploaded during an update.
    if (req.file) {                                                 //a new file was uploaded with the update request.
      // Delete old file if exists
      if (existingPage.hasFile && existingPage.filePath) {
        fs.unlink(existingPage.filePath, (err) => {                 //If the page already has a file, delete it from the filesystem using fs.unlink().
          if (err) console.error("Error deleting old file:", err);  //If deletion fails, the error is logged but doesn't crash the app.
        });
      }

      updateData.hasFile = true;                               //Flags that a file is now attached to this page.
      updateData.fileName = req.file.filename;                 //Stores the saved name of the new file (set by multer)
      updateData.originalFileName = req.file.originalname;     //Stores the original name of the uploaded file
      updateData.fileSize = req.file.size;
      updateData.fileMimeType = req.file.mimetype;
      updateData.filePath = req.file.path;                     //Stores the path where the new file is saved on the serve
      updateData.url = `/api/cms-pages/file/${req.params.id}`; //Sets the download/view URL for the new file.
    }

    const page = await CMSPage.findByIdAndUpdate(req.params.id, updateData, {       //Finds a document (page) by its _id, Updates it with new data (updateData)
      new: true,                                         //Returns the updated document (after changes are applied).If you omit this, it returns the old document (before update)
      runValidators: true,                               //Makes sure Mongoose runs the validation rules defined in the schema.
    })
      .populate("menuType", "name")
      .populate("parentId", "pageTitle");

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }
    
    res.json({
      success: true,
      message: "Page updated successfully",
      data: page,
    });
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists. Please choose a different slug.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating page",
      error: error.message,
    });
  }
};

// Delete page
const deletePage = async (req, res) => {
  try {
    const page = await CMSPage.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Delete associated file if exists
    if (page.hasFile && page.filePath) {
      fs.unlink(page.filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    
    await CMSPage.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting page",
      error: error.message,
    });
  }
};

// Toggle page status
const togglePageStatus = async (req, res) => {             //This function toggles the isEnabled status(If the page is currently enabled, it will disable it/If it is disabled, it will enable it.)
  try {
    const page = await CMSPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    page.isEnabled = !page.isEnabled;                      //If isEnabled is true, it becomes false (disabled)/If isEnabled is false, it becomes true (enabled).
    page.updatedBy = "Admin";
    await page.save();

    const updatedPage = await CMSPage.findById(page._id)   //After saving, fetch the same page again, but with Populated Fields(menuType to show its name/parentId to show its parent page title)
      .populate("menuType", "name")
      .populate("parentId", "pageTitle");

    res.json({
      success: true,
      message: `Page ${page.isEnabled ? "enabled" : "disabled"} successfully`,
      data: updatedPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating page status",
      error: error.message,
    });
  }
};

// Get pages for dropdown (parent selection)
const getPagesForDropdown = async (req, res) => {
  try {
    const pages = await CMSPage.find({ isEnabled: true })
      .select("_id pageTitle")                                 //Instead of returning the full page document, this returns only two fields: _id → used as the value in a dropdown & pageTitle → used as the visible label in a dropdown
      .sort({ pageTitle: 1 });                                 //Sorts the results by pageTitle in ascending (A–Z) order

    res.json({                                                 //Returns a success response with the list of pages.
      success: true,
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pages for dropdown",
      error: error.message,
    });
  }
};

// Serve file, This function allows a browser to view or download the file associated with a CMS page by visiting a specific URL (like `/api/cms-pages/file/:id`).
const serveFile = async (req, res) => {
  try {
    const page = await CMSPage.findById(req.params.id);
    
    if (!page || !page.hasFile || !page.filePath) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const filePath = path.resolve(page.filePath);   //Converts the stored relative path to an absolute path on the server. Makes sure the path is valid and safe for reading.
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {                //Before trying to send the file, it checks whether the actual file still exists in the filesystem(usingNode.js inbuilt fs module).
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', page.fileMimeType);         //Content-Type: tells the browser what type of file it is (PDF, image, etc.)
    res.setHeader('Content-Disposition', `inline; filename="${page.originalFileName}"`);    //Allows the browser to preview the file (like a PDF in-browser). (Change inline to attachment if you want to force download)

    // Stream the file
    const fileStream = fs.createReadStream(filePath);       //Creates a readable stream for the file.
    fileStream.pipe(res);                                   //Sends it to the browser without loading the whole file into memory.

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error serving file",
      error: error.message,
    });
  }
};

module.exports = {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  togglePageStatus,
  getPagesForDropdown,
  serveFile,
};

// for line no. 361 & 362 -> fileStream is reading the file in chunks.res (the response object) is a writable stream (i.e., it sends data to the browser)&.pipe() sends chunks of data from the file stream directly to the response stream, without loading the entire file into memory.