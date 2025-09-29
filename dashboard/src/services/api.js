import axios from "axios";

const api = axios.create({
  baseURL: "https://motosync-iot.onrender.com", // endereço da sua API FastAPI
});

export default api;
