# SmartStock – Complete MERN Project

SmartStock is an Inventory and Order Management System built using React, Node.js, Express, and MongoDB. The application uses Indian Rupees (₹ INR) as its currency.

## 1. Required Software

- Node.js (LTS version)
- MongoDB Community Server (must be running) or a MongoDB Atlas URI
- Visual Studio Code

## 2. Extract the ZIP File

Extract the ZIP file into a new folder, for example: `Desktop/SmartStock_Complete`.

Do not directly overwrite your existing SmartStock folder.

## 3. Backend Setup

Open the project folder in VS Code and run the following commands in the terminal:

```powershell
cd backend
npm install
```

Copy `backend/.env.example` and rename the copied file to `.env` in the same folder.

For local MongoDB, use the following default configuration:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartstock
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```powershell
npm run dev
```

If the setup is successful, you should see:

- `MongoDB Connected Successfully`
- `SmartStock Server running on port 5000`

Open the following URL in your browser to check the backend health:

http://localhost:5000/api/health

## 4. Demo Data (50-50-50)

Open a new terminal and run the following commands from the project root:

```powershell
cd backend
npm run seed
```

This creates:

- 50 sample Products
- 50 sample Customers
- 50 sample Orders
- One demo admin account

The seed script uses stable IDs and keys to update or insert demo records. It does not delete other non-demo records.

Sample demo orders are created as historical examples and do not deduct stock from inventory.

**Demo Login**

- Email: Not specified in the provided setup text.
- Password: Not specified in the provided setup text.

Register your own account and use your own credentials. Do not keep the demo admin account in a production environment.

For production, configure a strong `JWT_SECRET` in your `.env` file.

## 5. Frontend Setup

Open a second VS Code terminal and run these commands from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend in your browser:

http://localhost:5173

## 6. Features

- User registration and JWT authentication
- Product CRUD operations
- SKU, category, price, stock, and image path/URL management
- Customer CRUD operations
- Order creation with automatic stock deduction
- Stock restoration when an order is cancelled or deleted
- Dashboard metrics
- Sales and inventory summaries
- CSV/JSON data export
- CSV/JSON import for products and customers
- Import adds records without replacing existing records
- INR currency formatting
- Responsive user interface

## 7. Product Images

The folder `frontend/public/images/products/` contains 50 PNG demo product thumbnails.

These are designed catalog thumbnails, not actual product photographs.

You can enter your own JPG/PNG image URL or public image path in the Product form.

## 8. Common Problems and Solutions

**ERR_CONNECTION_REFUSED on :5000**

The backend server is not running. Open the backend terminal