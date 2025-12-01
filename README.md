# 📦 SupplyOnCHAIN

SupplyOnCHAIN is a blockchain-powered supply chain tracker that records product journeys immutably on Ethereum.  
It leverages **React** for the frontend, **Node.js/Express** for the backend, and **Foundry** for smart contract development.  
Products move through stages like manufacturer, wholesaler, and retailer, with each step logged via smart contracts for tamper-proof audit trails.

![Alt text](assets/my-image.png)


---

## 🚀 Live Demo
- **Frontend (Dashboard):** [supply-on-chain.vercel.app](https://supply-on-chain.vercel.app)
- **Backend API:** [supplyonchain.onrender.com](https://supplyonchain.onrender.com)

---

## 📂 Repository Structure
This monorepo contains four main parts:

```
supplyOnCHAIN/
│── backend/          # Node.js + Express API server
│── contracts/        # Solidity smart contracts (Foundry framework)
│── frontend/         # React + Vite frontend dashboard
│── assets/           # image resources
```

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, TailwindCSS, Thirdweb SDK
- **Backend:** Node.js, Express, MongoDB, QRCode
- **Smart Contracts:** Solidity, Foundry
- **Deployment:** Vercel (frontend), Render (backend)
- **Blockchain:** Ethereum/sepolia (testnet)

---

## 📖 Documentation
Detailed documentation is available in the project doc:  
👉 [SupplyOnCHAIN Docs](https://docs.google.com/document/d/1XNJbcGdV6BooAQbXWeYe4fxrB7j9XaP2fw08eUz5ve0/edit?tab=t.0#heading=h.c2y54ldk8pm4)

---

## 🎥 Demo Video
Watch the walkthrough on YouTube:  
👉 [SupplyOnCHAIN Demo](https://youtu.be/QyDDm3KZdVk?si=6nVCaWfsUlpqyRfk)

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/nikhilxhub/supplyOnCHAIN.git
cd supplyOnCHAIN
```

### 2. Backend Setup
```bash
cd backend
bun install   # or npm install
bun run dev   # or npm run dev
```
- Configure `.env`:
  ```env
  MONGO_URI=<your_mongodb_connection>
  PORT=5000
  ```

### 3. Contracts Setup
```bash
cd contracts
forge build
forge test
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Configure `.env`:
  ```env
  VITE_BACKEND=http://localhost:5000
  VITE_CONTRACT=<deployed_contract_address>
  VITE_THIRDWEB_CLIENT_ID=<your_thirdweb_client_id>
  ```

---

## 🔑 Features
- Immutable product tracking on Ethereum
- QR code integration for real-world scanning
- Role-based product transfer (manufacturer → wholesaler → retailer)
- Dashboard for product visibility
- Tamper-proof audit trails

---

## 📌 Roadmap
- ✅ Core product lifecycle tracking
- ✅ Frontend dashboard with Thirdweb integration
- 🔄 Advanced analytics & reporting
- 🔄 Role-based access control

---

## 🤝 Contributing
Pull requests are welcome!  
For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License
MIT License © 2025 [Nikhil Ummidi](https://github.com/nikhilxhub)

```