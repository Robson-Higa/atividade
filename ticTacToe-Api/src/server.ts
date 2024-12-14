import { server } from "./app";

const port = process.env.PORT || 3001;

server.listen(port, () => console.log("API em execução"));