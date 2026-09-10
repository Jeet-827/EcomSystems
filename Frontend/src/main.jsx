import { createRoot } from "react-dom/client";
import "./index.css";
import "./Admin/admin.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Providerfun } from "./store/Usercontext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Providerfun>
      <App />
    </Providerfun>
  </BrowserRouter>,
);
